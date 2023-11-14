import { WebsocketRequestHandler } from "express-ws";
import { AccountInfo, idValidator } from "vennt-library";
import { validateToken } from "../utils/jwt";

export const campaignWSHandler: WebsocketRequestHandler = async (ws, req) => {
  let isConnected = true;
  let campaignId: string | null = null;
  let account: AccountInfo | null = null;

  const closeConnection = () => {
    ws.close();
    isConnected = false;
  };

  try {
    campaignId = idValidator.parse(req.params.id);
  } catch (err) {
    closeConnection();
  }

  // TODO: add 5 sec timeout or something where if a ws connection has been made and no auth sent, then we disconnect

  ws.on("message", (buffer: Buffer) => {
    if (!account) {
      const token = buffer.toString();
      try {
        const validAccount = validateToken(token);
        // validate read permission to campaign before continuing
        account = validAccount;
        ws.send("listening");
      } catch (err) {
        closeConnection();
      }
    } else {
      console.log("msg", buffer.toString());
    }
  });
  ws.on("close", () => {
    isConnected = false;
  });

  while (isConnected) {
    // @ts-expect-error Bun is defined by Bun runtime
    await Bun.sleep(500);
    ws.send(`time: ${Date.now()}`);
  }
  console.log("after connection is closed");
};
