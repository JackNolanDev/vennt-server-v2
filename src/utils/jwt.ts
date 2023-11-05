import { ResultError, UNAUTHORIZED_RESULT } from "./db";
import { AccountInfo, accountInfoValidator } from "vennt-library";
import { JwtPayload, sign, verify } from "jsonwebtoken";
import type { Request } from "express";

const secret = process.env.SESSION_SECRET ?? "development secret";

export const generateToken = (account: AccountInfo): string => {
  return sign(account, secret, { expiresIn: "192h" });
};

export const validateToken = (token: string): AccountInfo => {
  let decoded: JwtPayload | string = "";
  try {
    decoded = verify(token, secret);
  } catch (_) {
    throw new ResultError(UNAUTHORIZED_RESULT);
  }
  if (typeof decoded !== "string") {
    const account = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role,
    };
    const parsedAccount = accountInfoValidator.safeParse(account);
    if (parsedAccount.success) {
      return parsedAccount.data;
    }
  }
  throw new ResultError(UNAUTHORIZED_RESULT);
};

export const validateAuthHeader = (req: Request): AccountInfo => {
  const account = validateOptionalAuthHeader(req);
  if (account) {
    return account;
  }
  throw new ResultError(UNAUTHORIZED_RESULT);
};

export const validateOptionalAuthHeader = (
  req: Request
): AccountInfo | undefined => {
  const auth = req.header("Authorization");
  const token = auth?.split(" ")[1]; // token comes after first space
  if (token) {
    return validateToken(token);
  }
  return undefined;
};
