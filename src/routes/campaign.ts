import express from "express";
import type { Request } from "express";
import {
  validateAdminWriteCampaignPermission,
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
  dbRemoveCampaignEntity,
  dbRemoveCampaignMember,
  dbUpdateCampaignDesc,
  dbUpdateCampaignMemberRole,
} from "../daos/campaignDao";
import { validateAuthHeader } from "../utils/jwt";
import {
  CAMPAIGN_ROLE_GM,
  campaignDescValidator,
  campaignRoleValidator,
  idValidator,
  postCampaignEntityValidator,
  postCampaignValidator,
} from "vennt-library";

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

const putCampaignDesc = async (req: Request) => {
  const account = validateAuthHeader(req);
  const campaignId = idValidator.parse(req.params.id);
  await validateAdminWriteCampaignPermission(account, campaignId);
  const body = campaignDescValidator.parse(req.body);
  return await dbUpdateCampaignDesc(campaignId, body);
};

const addEntityToCampaign = async (req: Request) => {
  const account = validateAuthHeader(req);
  const body = postCampaignEntityValidator.parse(req.body);
  const campaignId = idValidator.parse(req.params.id);
  const role = await validateWriteCampaignPermission(account, campaignId);
  await validateEditEntityPermission(account, body.entity_id);
  return await dbInsertCampaignEntity(campaignId, body, role);
};

const deleteCampaignEntity = async (req: Request) => {
  const account = validateAuthHeader(req);
  const campaignId = idValidator.parse(req.params.id);
  const entityId = idValidator.parse(req.params.entityId);
  const role = await validateWriteCampaignPermission(account, campaignId);
  if (role !== CAMPAIGN_ROLE_GM) {
    await validateEditEntityPermission(account, entityId);
  }
  return await dbRemoveCampaignEntity(campaignId, entityId);
};

const updateCampaignMemberRole = async (req: Request) => {
  const account = validateAuthHeader(req);
  const campaignId = idValidator.parse(req.params.id);
  const memberId = idValidator.parse(req.params.memberId);
  const newRole = campaignRoleValidator.parse(req.body);
  await validateAdminWriteCampaignPermission(account, campaignId);
  return await dbUpdateCampaignMemberRole(campaignId, memberId, newRole);
};

const deleteCampaignMember = async (req: Request) => {
  const account = validateAuthHeader(req);
  const campaignId = idValidator.parse(req.params.id);
  const memberId = idValidator.parse(req.params.memberId);
  await validateAdminWriteCampaignPermission(account, campaignId);
  return await dbRemoveCampaignMember(campaignId, memberId);
};

const router = express.Router();
router.post("", wrapHandler(addCampaign));
router.get("", wrapHandler(listCampaign));
router.get("/:id", wrapHandler(fetchCampaignDetails));
router.put("/:id/desc", wrapHandler(putCampaignDesc));
router.post("/:id/entity", wrapHandler(addEntityToCampaign));
router.delete("/:id/entity/:entityId", wrapHandler(deleteCampaignEntity));
router.put("/:id/member/:memberId/role", wrapHandler(updateCampaignMemberRole));
router.delete("/:id/member/:memberId", wrapHandler(deleteCampaignMember));
export default router;
