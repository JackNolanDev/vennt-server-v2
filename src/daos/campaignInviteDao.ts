import { handleTransaction } from "../utils/db";
import pool from "../utils/pool";
import {
  PostCampaignInvite,
  AccountInfo,
  Result,
  CampaignInvite,
  CampaignInviteWithDetails,
} from "../utils/types";
import {
  sqlInsertCampaignInvite,
  sqlFetchCampaignInvitesByRecipientId,
  sqlInsertCampaignMemberFromInvite,
  sqlDeleteCampaignInvite,
} from "./sql";

export const dbInsertCampaignInvite = async (
  invite: PostCampaignInvite,
  from: AccountInfo
): Promise<Result<CampaignInvite>> => {
  return sqlInsertCampaignInvite(pool, invite, from);
};

export const dbListCampaignInvites = async (
  account: AccountInfo
): Promise<Result<CampaignInviteWithDetails[]>> => {
  return await sqlFetchCampaignInvitesByRecipientId(
    pool,
    account.id,
    account.username
  );
};

export const dbAcceptCampaignInvite = async (
  inviteId: string,
  accountId: string
): Promise<Result<boolean>> => {
  return handleTransaction(async (tx) => {
    await sqlInsertCampaignMemberFromInvite(tx, inviteId, accountId);
    return sqlDeleteCampaignInvite(tx, inviteId, accountId);
  });
};

export const dbDeclineCampaignInvite = async (
  inviteId: string,
  accountId: string
): Promise<Result<boolean>> => {
  return sqlDeleteCampaignInvite(pool, inviteId, accountId);
};
