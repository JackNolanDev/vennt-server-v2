import express from "express";
import type { Request, Response } from "express";
import { loginRequestValidator, signupRequestValidator } from "../utils/types";
import { createAccount, verifyPassword } from "../daos/authDao";
import { parseBody, pushResponse } from "../utils/express";
import { requireLoggedIn } from "../utils/middleware";

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
  const body = parseBody(req, res, loginRequestValidator);
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
  pushResponse(res, { success: true, result: true });
};

const account = async (req: Request, res: Response) => {
  pushResponse(res, { success: true, result: req.session.account });
};

const router = express.Router();
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", requireLoggedIn, logout);
router.get("/account", requireLoggedIn, account);
export default router;
