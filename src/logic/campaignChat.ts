import { randomUUID } from "crypto";
import {
  CHAT_TYPE,
  ChatMessage,
  RequestOldChatMessages,
  SendChatMessage,
} from "vennt-library";
import {
  broadcastToCampaign,
  broadcastToCampaignAccounts,
} from "./campaignSubscriptions";
import {
  dbFetchChatMessages,
  dbSaveChatMessage,
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
  broadcastNewChatMessage(campaignId, newMessage);
  dbSaveChatMessage(campaignId, newMessage);
};

const broadcastNewChatMessage = (campaignId: string, msg: ChatMessage) => {
  const stringMsg = JSON.stringify(msg);
  if (msg.for) {
    broadcastToCampaignAccounts(campaignId, stringMsg, [msg.for]);
  } else {
    broadcastToCampaign(campaignId, stringMsg);
  }
};

export const handleOldChatMessagesRequest = async (
  accountId: string,
  campaignId: string,
  request: RequestOldChatMessages
) => {
  await dbFetchChatMessages(accountId, campaignId, request.cursor);
};
