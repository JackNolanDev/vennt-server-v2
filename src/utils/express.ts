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

export const parseParam = <T extends z.ZodTypeAny>(
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

// WIP input parser - doesn't quite define the types correctly

type InputShape<
  BodyValidator extends z.ZodTypeAny,
  ParamValidators extends Record<string, z.ZodTypeAny>
> = {
  body?: BodyValidator;
  params?: ParamValidators;
};

export const parseInputs = <
  BodyValidator extends z.ZodTypeAny,
  ParamValidators extends Record<string, z.ZodTypeAny>
>(
  req: Request,
  res: Response,
  input: InputShape<BodyValidator, ParamValidators>
):
  | ({ body?: z.infer<BodyValidator> } & Record<
      keyof ParamValidators,
      z.infer<ParamValidators[keyof ParamValidators]>
    >)
  | undefined => {
  const response: Partial<
    { body?: z.infer<BodyValidator> } & Record<
      keyof ParamValidators,
      z.infer<ParamValidators[keyof ParamValidators]>
    >
  > = {};
  if (input.body) {
    const val = parseBody(req, res, input.body);
    if (!val) return;
    response.body = val;
  }
  if (input.params) {
    Object.entries(input.params).forEach(([param, validator]) => {
      const val = parseParam(req, res, param, validator);
      if (!val) return;
      response[param as keyof ParamValidators] = val;
    });
  }
  return response as { body?: z.infer<BodyValidator> } & Record<
    keyof ParamValidators,
    z.infer<ParamValidators[keyof ParamValidators]>
  >;
};
