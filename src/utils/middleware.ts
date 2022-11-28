import type { NextFunction, Request, Response } from "express";
import { resError } from "./express";

export const requireLoggedIn = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.account) {
    resError(res, "Not Authorized", 403);
  } else {
    next();
  }
}
