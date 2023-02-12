import type { Request, Response } from "express";
import { ZodError } from "zod";
import { AccountInfo, Result } from "./types";
import { dbUserOwnsEntity } from "../daos/entityDao";
import {
  FORBIDDEN_RESULT,
  ResultError,
  SERVER_ERROR_RESULT,
  wrapErrorResult,
} from "./db";
import { validateAuthHeader } from "./jwt";

export const wrapHandler = <T>(
  handler: (req: Request) => Promise<Result<T>>
): ((req: Request, res: Response) => Promise<void>) => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const response = await handler(req);
      pushResponse(res, response);
    } catch (err) {
      if (err instanceof ZodError) {
        pushResponse(res, wrapErrorResult(err.message));
      } else if (err instanceof ResultError) {
        pushResponse(res, err.result);
      } else {
        console.error(err);
        pushResponse(res, SERVER_ERROR_RESULT);
      }
    }
  };
};

export const pushResponse = <T>(res: Response, result: Result<T>): void => {
  if (result.success) {
    res.status(200).json(result);
  } else {
    res.status(result.code).json({ success: false, error: result.error })
  }
};

export const validateEditEntityPermission = async (
  account: AccountInfo,
  entityId: string
): Promise<void> => {
  const check = await dbUserOwnsEntity(entityId, account.id);
  if (!check.success) {
    throw new ResultError(check);
  } else if (!check.result && account.role !== "ADMIN") {
    throw new ResultError(
      wrapErrorResult("Not allowed to edit this entity", 403)
    );
  }
};

export const validateAdmin = (req: Request): void => {
  const account = validateAuthHeader(req);
  if (account.role !== "ADMIN") {
    throw new ResultError(FORBIDDEN_RESULT);
  }
};
