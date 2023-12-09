import {
  AttributeValue,
  DeleteItemCommand,
  PutItemCommand,
  QueryCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import {
  ChatMessage,
  OLD_CHAT_TYPE,
  OldChatMessages,
  StoredMessage,
} from "vennt-library";
import { getDynamoClient } from "../utils/dynamo";
import { ResultError, wrapErrorResult } from "../utils/db";

const CAMPAIGN_CHAT_TABLE = "campaign_chat";

export const dbSaveChatMessage = (
  campaignId: string,
  message: StoredMessage
) => {
  const { request_id, ...baseMessage } = message; // do not save request_id in DB
  const command = new PutItemCommand({
    TableName: CAMPAIGN_CHAT_TABLE,
    Item: formatObjForDynamo({ campaign_id: campaignId, ...baseMessage }),
  });
  getDynamoClient().send(command);
};

export const dbFetchChatMessages = async (params: {
  campaignId: string;
  accountId: string;
  cursor?: string;
  isGm?: boolean;
}): Promise<OldChatMessages> => {
  const { campaignId, accountId, cursor, isGm } = params;
  const block_gm_only = isGm ? "" : "attribute_not_exists(gm_only) and ";
  const command = new QueryCommand({
    TableName: CAMPAIGN_CHAT_TABLE,
    // IndexName: "time-index",
    ExpressionAttributeValues: {
      ":campaignId": { S: campaignId },
      ":accountId": { S: accountId },
    },
    KeyConditionExpression: "campaign_id = :campaignId",
    FilterExpression: `${block_gm_only} (attribute_not_exists(#f) or sender = :accountId or #f = :accountId)`,
    ExpressionAttributeNames: { "#f": "for" },
    ScanIndexForward: false, // We want to fetch the most recent messages first
    Limit: 30,
    ...(cursor && {
      ExclusiveStartKey: JSON.parse(Buffer.from(cursor, "base64").toString()),
    }),
  });

  const result = await getDynamoClient().send(command);
  if (result.$metadata.httpStatusCode !== 200 || result.Items === undefined) {
    throw new ResultError(wrapErrorResult("Dynamo query failed", 500));
  }

  return {
    type: OLD_CHAT_TYPE,
    message: result.Items.map((msg): StoredMessage => {
      delete msg.campaign_id;
      // could pass through zod to validate row, I guess
      return formatObjFromDynamo(msg) as StoredMessage;
    }),
    ...(result.LastEvaluatedKey && {
      cursor: Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString(
        "base64"
      ),
    }),
  };
};

export const dbUpdateChatMessage = async (
  campaignId: string,
  accountId: string,
  messageId: string,
  newMessage: string
): Promise<ChatMessage> => {
  const command = new UpdateItemCommand({
    TableName: CAMPAIGN_CHAT_TABLE,
    Key: { campaign_id: { S: campaignId }, id: { S: messageId } },
    ExpressionAttributeValues: {
      ":accountId": { S: accountId },
      ":newMessage": { S: newMessage },
      ":updated": { S: new Date().toISOString() },
    },
    // Only the user who sent the message may update it, for now
    ConditionExpression: "sender = :accountId",
    UpdateExpression: "SET message = :newMessage, updated = :updated",
    ReturnValues: "ALL_NEW",
    ReturnValuesOnConditionCheckFailure: "NONE",
  });

  const result = await getDynamoClient().send(command);

  if (
    result.$metadata.httpStatusCode !== 200 ||
    result.Attributes === undefined
  ) {
    throw new ResultError(wrapErrorResult("Dynamo update failed", 500));
  }
  return formatObjFromDynamo(result.Attributes) as ChatMessage;
};

export const dbDeleteChatMessage = async (
  campaignId: string,
  accountId: string,
  messageId: string
) => {
  const command = new DeleteItemCommand({
    TableName: CAMPAIGN_CHAT_TABLE,
    Key: { campaign_id: { S: campaignId }, id: { S: messageId } },
    ExpressionAttributeValues: { ":accountId": { S: accountId } },
    // Only the user who sent the message may delete it, for now
    ConditionExpression: "sender = :accountId",
  });

  await getDynamoClient().send(command);
};

const formatObjForDynamo = (
  obj: Record<string, string>
): Record<string, AttributeValue> =>
  Object.entries(obj).reduce<Record<string, AttributeValue>>(
    (acc, [key, val]) => {
      acc[key] = { S: val };
      return acc;
    },
    {}
  );
const formatObjFromDynamo = (
  obj: Record<string, AttributeValue>
): Record<string, string> =>
  Object.entries(obj).reduce<Record<string, string>>((acc, [key, val]) => {
    if (val.S) {
      acc[key] = val.S;
    }
    return acc;
  }, {});
