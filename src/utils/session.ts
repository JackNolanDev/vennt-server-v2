import { AccountInfo } from "./types";

// adds `account` as a field on the user session

declare module "express-session" {
  interface Session {
    account: AccountInfo;
  }
}
