import {
  CampaignInviteLink,
  PostCampaignInviteLink,
  Result,
} from "vennt-library";
import {
  sqlDeleteCampaignInviteLink,
  sqlFetchCampaignByCampaignInviteLink,
  sqlInsertCampaignInviteLink,
  sqlInsertCampaignMember,
} from "./sql";
import pool from "../utils/pool";
import { handleTransaction, unwrapResultOrError } from "../utils/db";

export const dbInsertCampaignInviteLink = (
  invite: PostCampaignInviteLink
): Promise<Result<CampaignInviteLink>> => {
  return sqlInsertCampaignInviteLink(pool, invite);
};

export const dbFetchCampaignByInviteLink = (hash: string) => {
  return sqlFetchCampaignByCampaignInviteLink(pool, hash);
};

export const dbAddCampaignMemberFromCampaignLink = (
  hash: string,
  accountId: string
) => {
  return handleTransaction(async (tx) => {
    const campaign = unwrapResultOrError(
      await sqlFetchCampaignByCampaignInviteLink(tx, hash)
    );
    return await sqlInsertCampaignMember(
      tx,
      campaign.id,
      accountId,
      "SPECTATOR"
    );
  });
};

export const dbDeleteCampaignInviteLink = (
  campaignInviteLinkId: string,
  campaignId: string
) => {
  return sqlDeleteCampaignInviteLink(pool, campaignInviteLinkId, campaignId);
};
