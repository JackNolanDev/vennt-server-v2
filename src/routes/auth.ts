import express from "express";
import type { Request } from "express";
import {
  AccountToken,
  Result,
  loginRequestValidator,
  signupRequestValidator,
} from "../utils/types";
import { createAccount, verifyPassword } from "../daos/authDao";
import { wrapHandler } from "../utils/express";
import { generateToken } from "../utils/jwt";
import { wrapSuccessResult } from "../utils/db";

const signup = async (req: Request): Promise<Result<AccountToken>> => {
  const body = signupRequestValidator.parse(req.body);
  const account = await createAccount(body);
  const token = generateToken(account);
  return wrapSuccessResult({ token });
};

const login = async (req: Request): Promise<Result<AccountToken>> => {
  const body = loginRequestValidator.parse(req.body);
  const account = await verifyPassword(body);
  const token = generateToken(account);
  return wrapSuccessResult({ token });
};

const router = express.Router();
router.post("/signup", wrapHandler(signup));
router.post("/login", wrapHandler(login));
export default router;
