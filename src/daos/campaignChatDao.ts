import {
  AttributeValue,
  PutItemCommand,
  QueryCommand,
} from "@aws-sdk/client-dynamodb";
import { ChatMessage, OLD_CHAT_TYPE, OldChatMessages } from "vennt-library";
import { getDynamoClient } from "../utils/dynamo";
import { ResultError, wrapErrorResult } from "../utils/db";

const CAMPAIGN_CHAT_TABLE = "campaign_chat";

export const dbSaveChatMessage = (campaignId: string, message: ChatMessage) => {
  const command = new PutItemCommand({
    TableName: CAMPAIGN_CHAT_TABLE,
    Item: formatObjForDynamo({ campaign_id: campaignId, ...message }),
  });
  getDynamoClient().send(command);
};

export const dbFetchChatMessages = async (
  campaignId: string,
  accountId: string,
  cursor?: string
): Promise<OldChatMessages> => {
  const command = new QueryCommand({
    TableName: CAMPAIGN_CHAT_TABLE,
    IndexName: "time-index",
    ExpressionAttributeValues: {
      ":campaignId": { S: campaignId },
      ":accountId": { S: accountId },
    },
    KeyConditionExpression: "campaign_id = :campaignId",
    FilterExpression:
      "attribute_not_exists(#f) or sender = :accountId or #f = :accountId",
    ExpressionAttributeNames: { "#f": "for" },
    ScanIndexForward: false, // We want to fetch the most recent messages first
    Limit: 100,
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
    message: result.Items.map((msg): ChatMessage => {
      delete msg.campaign_id;
      // could pass through zod to validate row, I guess
      return formatObjFromDynamo(msg) as ChatMessage;
    }),
    ...(result.LastEvaluatedKey && {
      c: Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString(
        "base64"
      ),
    }),
  };
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
