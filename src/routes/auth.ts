import express from "express";
import type { Request, Response } from "express";
import { signupRequestValidator } from "../utils/types";
import { createAccount } from "../daos/authDao";
import { pushResponse } from "../utils/express";
const router = express.Router();

const signup = async (req: Request, res: Response) => {
  const body = signupRequestValidator.parse(req.body);
  const account = await createAccount(body);
  if (account.success) {
    // TODO: Should send an email to verify account?
    req.session.account = account.result;
  }
  pushResponse(res, account);
};

router.post("/signup", signup);
export default router;
