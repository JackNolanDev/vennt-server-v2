import type { Response } from "express";
import { Result } from "./types";

export const pushResponse = <T>(
  expressResponse: Response,
  res: Result<T>
): void => {
  if (res.success) {
    expressResponse.json(res);
    expressResponse.sendStatus(200);
  } else {
    expressResponse.json({ success: false, error: res.error });
    expressResponse.sendStatus(res.code);
  }
};
