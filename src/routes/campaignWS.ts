import { WebsocketRequestHandler } from "express-ws";
import {
  AccountInfo,
  CONNECTION_AUTHORIZED_MSG,
  CampaignRole,
  REQUEST_CHAT_TYPE,
  SEND_CHAT_TYPE,
  campaignWSMessageValidator,
  idValidator,
} from "vennt-library";
import { validateToken } from "../utils/jwt";
import { dbFetchCampaignRole } from "../daos/campaignDao";
import { unwrapResultOrError } from "../utils/db";
import { randomUUID } from "crypto";
import {
  subscribeToCampaign,
  unsubscribeFromCampaign,
} from "../logic/campaignSubscriptions";
import { dbFetchChatMessages } from "../daos/campaignChatDao";
import {
  handleNewChatMessage,
  handleOldChatMessagesRequest,
} from "../logic/campaignChat";

export const campaignWSHandler: WebsocketRequestHandler = async (ws, req) => {
  const connectionId = randomUUID();
  let isConnected = true;
  let campaignId: string = "";
  let account: AccountInfo | null = null;
  let role: CampaignRole | null = null;

  const closeConnection = () => {
    ws.close();
    cleanupConnection();
  };
  const cleanupConnection = () => {
    unsubscribeFromCampaign(campaignId, connectionId);
    isConnected = false;
  };

  try {
    campaignId = idValidator.parse(req.params.id);
  } catch (err) {
    closeConnection();
  }

  // If no auth message is sent within 5 seconds of connecting to this websocket, close the connection
  setTimeout(() => {
    if (!account) {
      closeConnection();
    }
  }, 5_000);

  ws.on("message", async (buffer: Buffer) => {
    if (!account) {
      const token = buffer.toString();
      try {
        const validAccount = validateToken(token);
        role = unwrapResultOrError(
          await dbFetchCampaignRole(campaignId!, validAccount.id)
        );
        account = validAccount;
        ws.send(CONNECTION_AUTHORIZED_MSG);
        subscribeToCampaign({
          accountId: account.id,
          campaignId,
          connectionId,
          sendMsg: (msg) => ws.send(msg),
        });
        const oldMessages = await dbFetchChatMessages(campaignId, account.id);
        ws.send(JSON.stringify(oldMessages));
      } catch (err) {
        closeConnection();
      }
    } else {
      try {
        const msg = campaignWSMessageValidator.parse(
          JSON.parse(buffer.toString())
        );
        switch (msg.type) {
          case SEND_CHAT_TYPE:
            handleNewChatMessage(account.id, campaignId, msg);
            break;
          case REQUEST_CHAT_TYPE:
            handleOldChatMessagesRequest(account.id, campaignId, msg);
            break;
        }
      } catch (err) {
        console.log("ignoring ws error", buffer.toString());
      }
    }
  });

  ws.on("close", () => {
    cleanupConnection();
  });
};
