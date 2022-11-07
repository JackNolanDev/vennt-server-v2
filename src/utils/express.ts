import type { Request, Response } from "express";
import { z } from "zod";
import { Result } from "./types";

export const pushResponse = <T>(
  res: Response,
  result: Result<T>
): void => {
  if (result.success) {
    res.json(result);
    res.sendStatus(200);
  } else {
    resError(res, result.error, result.code);
  }
};

export const parseBody = <T extends z.ZodTypeAny>(req: Request, res: Response, validator: T): z.infer<T> | undefined => {
  const parsed = validator.safeParse(req.body);
  if (parsed.success) {
    return parsed.data;
  }
  resError(res, parsed.error.message, 400);
}

export const resError = (res: Response, error: string, code: number):void => {
  res.json({ success: false, error });
  res.sendStatus(code);
}
