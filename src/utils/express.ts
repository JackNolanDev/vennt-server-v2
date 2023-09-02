import type { Request, Response } from "express";
import { ZodError } from "zod";
import { AccountInfo, CampaignRole, Result } from "./types";
import { dbUserCanEditEntity } from "../daos/entityDao";
import {
  FORBIDDEN_RESULT,
  ResultError,
  SERVER_ERROR_RESULT,
  wrapErrorResult,
} from "./db";
import { validateAuthHeader } from "./jwt";
import { dbFetchCampaignRole } from "../daos/campaignDao";

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
    res.status(result.code).json({ success: false, error: result.error });
  }
};

export const validateEditEntityPermission = async (
  account: AccountInfo,
  entityId: string,
  campaignId?: string
): Promise<void> => {
  if (account.role === "ADMIN") {
    return;
  }
  const check = await dbUserCanEditEntity(account.id, entityId, campaignId);
  if (!check.success) {
    throw new ResultError(check);
  } else if (!check.result) {
    throw new ResultError(
      wrapErrorResult("Not allowed to edit this entity", 403)
    );
  }
};

export const validateReadCampaignPermission = async (
  account: AccountInfo,
  campaignId: string
): Promise<CampaignRole> => {
  const role = await dbFetchCampaignRole(campaignId, account.id);
  if (!role.success) {
    throw new ResultError(role);
  } else if (!role.result && account.role !== "ADMIN") {
    throw new ResultError(
      wrapErrorResult("Not allowed to read this campaign", 403)
    );
  }
  return role.result;
};

export const validateWriteCampaignPermission = async (
  account: AccountInfo,
  campaignId: string
): Promise<CampaignRole> => {
  const role = await validateReadCampaignPermission(account, campaignId);
  if (role !== "GM" && role !== "PLAYER") {
    throw new ResultError(
      wrapErrorResult("Not allowed to edit this campaign", 403)
    );
  }
  return role;
};

export const validateAdminWriteCampaignPermission = async (
  account: AccountInfo,
  campaignId: string
): Promise<void> => {
  const role = await validateReadCampaignPermission(account, campaignId);
  if (role !== "GM") {
    throw new ResultError(
      wrapErrorResult("Not allowed to edit this campaign", 403)
    );
  }
};

export const validateAdmin = (req: Request): void => {
  const account = validateAuthHeader(req);
  if (account.role !== "ADMIN") {
    throw new ResultError(FORBIDDEN_RESULT);
  }
};
