import express from "express";
import type { Request, Response } from "express";
import {
  dangerousAccountInfoValidator,
  signupRequestValidator,
} from "../utils/types";
import { createAccount, verifyPassword } from "../daos/authDao";
import { parseBody, pushResponse, resError } from "../utils/express";

const router = express.Router();

const signup = async (req: Request, res: Response) => {
  const body = parseBody(req, res, signupRequestValidator);
  if (!body) {
    return;
  }
  const account = await createAccount(body);
  if (account.success) {
    // TODO: Should send an email to verify account?
    req.session.account = account.result;
  }
  pushResponse(res, account);
};

const login = async (req: Request, res: Response) => {
  const body = parseBody(req, res, dangerousAccountInfoValidator);
  if (!body) {
    return;
  }
  const account = await verifyPassword(body);
  if (account.success) {
    req.session.account = account.result;
  }
  pushResponse(res, account);
};

const logout = async (req: Request, res: Response) => {
  req.session.destroy((err) => console.error(err));
  res.sendStatus(200);
};

const me = async (req: Request, res: Response) => {
  if (!req.session.account) {
    resError(res, "Not Authorized", 403);
    return;
  }
  pushResponse(res, { success: true, result: req.session.account });
};

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", me);
export default router;
