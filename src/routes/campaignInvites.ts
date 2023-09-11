import express from "express";
import type { Request } from "express";
import {
  validateAdminWriteCampaignPermission,
  wrapHandler,
} from "../utils/express";
import {
  dbAcceptCampaignInvite,
  dbDeclineCampaignInvite,
  dbInsertCampaignInvite,
  dbListCampaignInvites,
} from "../daos/campaignInviteDao";
import { validateAuthHeader } from "../utils/jwt";
import { idValidator, postCampaignInviteValidator } from "../utils/types";

const addCampaignInvite = async (req: Request) => {
  const account = validateAuthHeader(req);
  const body = postCampaignInviteValidator.parse(req.body);
  await validateAdminWriteCampaignPermission(account, body.campaign_id);
  return await dbInsertCampaignInvite(body, account);
};

const listCampaignInvites = async (req: Request) => {
  const account = validateAuthHeader(req);
  return await dbListCampaignInvites(account);
};

const acceptCampaignInvite = async (req: Request) => {
  const account = validateAuthHeader(req);
  const inviteId = idValidator.parse(req.params.id);
  return await dbAcceptCampaignInvite(inviteId, account.id);
};

const declineCampaignInvite = async (req: Request) => {
  const account = validateAuthHeader(req);
  const inviteId = idValidator.parse(req.params.id);
  return await dbDeclineCampaignInvite(inviteId, account.id);
};

const router = express.Router();
router.post("", wrapHandler(addCampaignInvite));
router.get("", wrapHandler(listCampaignInvites));
router.post("/:id", wrapHandler(acceptCampaignInvite));
router.delete("/:id", wrapHandler(declineCampaignInvite));
export default router;
