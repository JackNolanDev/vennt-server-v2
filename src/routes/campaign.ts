import express from "express";
import type { Request } from "express";
import {
  validateEditEntityPermission,
  validateReadCampaignPermission,
  validateWriteCampaignPermission,
  wrapHandler,
} from "../utils/express";
import {
  dbFetchFullCampaignDetails,
  dbInsertCampaign,
  dbInsertCampaignEntity,
  dbListCampaigns,
} from "../daos/campaignDao";
import { validateAuthHeader } from "../utils/jwt";
import {
  idValidator,
  postCampaignEntityValidator,
  postCampaignValidator,
} from "../utils/types";

const addCampaign = async (req: Request) => {
  const account = validateAuthHeader(req);
  const body = postCampaignValidator.parse(req.body);
  return await dbInsertCampaign(body, account.id);
};

const listCampaign = async (req: Request) => {
  const account = validateAuthHeader(req);
  return await dbListCampaigns(account.id);
};

const fetchCampaignDetails = async (req: Request) => {
  const account = validateAuthHeader(req);
  const campaignId = idValidator.parse(req.params.id);
  const role = await validateReadCampaignPermission(account, campaignId);
  return await dbFetchFullCampaignDetails(campaignId, role);
};

const addEntityToCampaign = async (req: Request) => {
  const account = validateAuthHeader(req);
  const body = postCampaignEntityValidator.parse(req.body);
  const campaignId = idValidator.parse(req.params.id);
  const role = await validateWriteCampaignPermission(account, campaignId);
  await validateEditEntityPermission(account, body.entity_id);
  return await dbInsertCampaignEntity(campaignId, body, role);
};

const router = express.Router();
router.post("", wrapHandler(addCampaign));
router.get("", wrapHandler(listCampaign));
router.get("/:id", wrapHandler(fetchCampaignDetails));
router.post("/:id/entity", wrapHandler(addEntityToCampaign));
export default router;
