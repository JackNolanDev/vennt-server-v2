import type { Request, Response } from "express";
import { z } from "zod";
import { Result } from "./types";
import { dbUserOwnsEntity } from "../daos/entityDao";

export const pushResponse = <T>(res: Response, result: Result<T>): void => {
  if (result.success) {
    res.status(200).json(result);
  } else {
    resError(res, result.error, result.code);
  }
};

export const parseBody = <T extends z.ZodTypeAny>(
  req: Request,
  res: Response,
  validator: T
): z.infer<T> | undefined => {
  const parsed = validator.safeParse(req.body);
  if (parsed.success) {
    return parsed.data;
  }
  resError(res, parsed.error.message, 400);
};

export const resError = (res: Response, error: string, code: number): void => {
  res.status(code).json({ success: false, error });
};

export const validateParam = <T extends z.ZodTypeAny>(
  req: Request,
  res: Response,
  key: string,
  validator: T
): z.infer<T> | undefined => {
  const parsed = validator.safeParse(req.params[key]);
  if (parsed.success) {
    return parsed.data;
  }
  resError(res, parsed.error.message, 400);
};

export const entityEditPermission = async (
  res: Response,
  entityId: string,
  userId: string
): Promise<boolean> => {
  const check = await dbUserOwnsEntity(entityId, userId);
  if (check.success && !check.result) {
    resError(res, "Not allowed to edit this entity", 403);
    return true;
  }
  return false;
};
