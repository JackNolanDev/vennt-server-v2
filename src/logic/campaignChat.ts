import { randomUUID } from "crypto";
import {
  CHAT_TYPE,
  CampaignRole,
  CampaignWSMessage,
  ChatMessage,
  DICE_ROLL_RESULT_TYPE,
  DeleteChatMessage,
  DiceRollResult,
  RequestDiceRoll,
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
import { DiceRoll } from "@dice-roller/rpg-dice-roller";

export const handleNewChatMessage = (
  accountId: string,
  campaignId: string,
  msg: SendChatMessage
) => {
  const newMessage: ChatMessage = {
    ...msg,
    type: CHAT_TYPE,
    sender: accountId,
    // TODO: https://github.com/JackNolanDev/vennt-server-v2/issues/14
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

export const handleRequestDiceRoll = (
  accountId: string,
  campaignId: string,
  msg: RequestDiceRoll
) => {
  const result = JSON.stringify(new DiceRoll(msg.dice).toJSON());
  const newMessage: DiceRollResult = {
    ...msg,
    type: DICE_ROLL_RESULT_TYPE,
    sender: accountId,
    id: randomUUID(),
    time: new Date().toISOString(),
    result,
  };
  if (msg.gm_only) {
    broadcastMessage(campaignId, newMessage, [accountId], ["GM"]);
  } else {
    broadcastMessage(campaignId, newMessage);
  }
  dbSaveChatMessage(campaignId, newMessage);
};

export const handleOldChatMessagesRequest = async (
  accountId: string,
  campaignId: string,
  role: CampaignRole,
  request: RequestOldChatMessages
) => {
  const msg = await dbFetchChatMessages({
    accountId,
    campaignId,
    cursor: request.cursor,
    isGm: role === "GM",
  });
  broadcastMessage(campaignId, { ...msg, request_id: request.request_id }, [
    accountId,
  ]);
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
    request_id: request.request_id,
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
  accounts?: string[],
  roles?: CampaignRole[]
) => {
  const stringMsg = JSON.stringify(msg);
  if (accounts || roles) {
    broadcastToCampaignAccounts({
      campaignId,
      msg: stringMsg,
      accounts,
      roles,
    });
  } else {
    broadcastToCampaign(campaignId, stringMsg);
  }
};
