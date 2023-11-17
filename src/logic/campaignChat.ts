import { randomUUID } from "crypto";
import {
  CHAT_TYPE,
  CampaignWSMessage,
  ChatMessage,
  DeleteChatMessage,
  RequestOldChatMessages,
  RequestUpdateChatMessage,
  SendChatMessage,
  UPDATE_CHAT_TYPE,
  UpdatedChatMessage,
} from "vennt-library";
import {
  broadcastToCampaign,
  broadcastToCampaignAccounts,
} from "./campaignSubscriptions";
import {
  dbDeleteChatMessage,
  dbFetchChatMessages,
  dbSaveChatMessage,
  dbUpdateChatMessage,
} from "../daos/campaignChatDao";

export const handleNewChatMessage = (
  accountId: string,
  campaignId: string,
  msg: SendChatMessage
) => {
  const newMessage: ChatMessage = {
    ...msg,
    type: CHAT_TYPE,
    sender: accountId,
    id: randomUUID(),
    time: new Date().toISOString(),
  };
  broadcastMessage(
    campaignId,
    newMessage,
    chatMessageAccounts(accountId, newMessage)
  );
  dbSaveChatMessage(campaignId, newMessage);
};

export const handleOldChatMessagesRequest = async (
  accountId: string,
  campaignId: string,
  request: RequestOldChatMessages
) => {
  const msg = await dbFetchChatMessages(campaignId, accountId, request.cursor);
  broadcastMessage(campaignId, msg, [accountId]);
};

export const handleUpdateChatMessageRequest = async (
  accountId: string,
  campaignId: string,
  request: RequestUpdateChatMessage
) => {
  const fullChatMessage = await dbUpdateChatMessage(
    campaignId,
    accountId,
    request.id,
    request.message
  );
  const updateMessage: UpdatedChatMessage = {
    type: UPDATE_CHAT_TYPE,
    id: fullChatMessage.id,
    message: fullChatMessage.message,
    updated: fullChatMessage.updated!,
  };
  broadcastMessage(
    campaignId,
    updateMessage,
    chatMessageAccounts(accountId, fullChatMessage)
  );
};

export const handleDeleteChatMessage = async (
  accountId: string,
  campaignId: string,
  request: DeleteChatMessage
) => {
  await dbDeleteChatMessage(campaignId, accountId, request.id);
  broadcastMessage(campaignId, request);
};

const chatMessageAccounts = (
  accountId: string,
  msg: ChatMessage
): string[] | undefined => {
  if (msg.for) {
    if (msg.for === accountId) {
      return [accountId];
    }
    return [accountId, msg.for];
  }
  return undefined;
};

const broadcastMessage = (
  campaignId: string,
  msg: CampaignWSMessage,
  accounts?: string[]
) => {
  const stringMsg = JSON.stringify(msg);
  if (accounts) {
    broadcastToCampaignAccounts(campaignId, stringMsg, accounts);
  } else {
    broadcastToCampaign(campaignId, stringMsg);
  }
};
