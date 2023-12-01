import express from "express";
import type { Request } from "express";
import {
  validateAdminWriteCampaignPermission,
  wrapHandler,
} from "../utils/express";
import { validateAuthHeader } from "../utils/jwt";
import {
  campaignInviteLinkHashValidator,
  idValidator,
  postCampaignInviteLinkValidator,
} from "vennt-library";
import {
  dbAddCampaignMemberFromCampaignLink,
  dbDeleteCampaignInviteLink,
  dbFetchCampaignByInviteLink,
  dbInsertCampaignInviteLink,
} from "../daos/campaignInviteLinkDao";

const addCampaignInviteLink = async (req: Request) => {
  const account = validateAuthHeader(req);
  const body = postCampaignInviteLinkValidator.parse(req.body);
  await validateAdminWriteCampaignPermission(account, body.campaign_id);
  return await dbInsertCampaignInviteLink(body);
};

const fetchCampaignByCampaignInviteLink = async (req: Request) => {
  validateAuthHeader(req);
  const hash = campaignInviteLinkHashValidator.parse(req.params.hash);
  return await dbFetchCampaignByInviteLink(hash);
};

const addCampaignMemberFromCampaignLink = async (req: Request) => {
  const account = validateAuthHeader(req);
  const hash = campaignInviteLinkHashValidator.parse(req.params.hash);
  return await dbAddCampaignMemberFromCampaignLink(hash, account.id);
};

const deleteCampaignInviteLink = async (req: Request) => {
  const account = validateAuthHeader(req);
  const campaignId = idValidator.parse(req.params.campaignId);
  const campaignInviteLinkId = idValidator.parse(req.params.id);
  await validateAdminWriteCampaignPermission(account, campaignId);
  return await dbDeleteCampaignInviteLink(campaignInviteLinkId, campaignId);
};

const router = express.Router();
router.post("", wrapHandler(addCampaignInviteLink));
router.get("/:hash", wrapHandler(fetchCampaignByCampaignInviteLink));
router.post("/:hash", wrapHandler(addCampaignMemberFromCampaignLink));
router.delete("/:campaignId/:id", wrapHandler(deleteCampaignInviteLink));
export default router;
