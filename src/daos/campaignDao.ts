import {
  AccountInfo,
  CampaignEntity,
  CampaignInvite,
  CampaignInviteWithDetails,
  CampaignRole,
  CampaignWithRole,
  FullCampaignDetails,
  PostCampaign,
  PostCampaignEntity,
  PostCampaignInvite,
  Result,
} from "../utils/types";
import {
  sqlDeleteCampaignInvite,
  sqlFetchCampaignById,
  sqlFetchCampaignEntitiesByCampaignId,
  sqlFetchCampaignInvitesByCampaignId,
  sqlFetchCampaignInvitesByRecipientId,
  sqlFetchCampaignMembersByCampaignId,
  sqlFetchCampaignRole,
  sqlInsertCampaign,
  sqlInsertCampaignEntity,
  sqlInsertCampaignInvite,
  sqlInsertCampaignMember,
  sqlInsertCampaignMemberFromInvite,
  sqlListCampaignsForAccount,
} from "./sql";
import pool from "../utils/pool";
import {
  UNAUTHORIZED_RESULT,
  handleTransaction,
  unwrapResultOrError,
  wrapSuccessResult,
} from "../utils/db";

export const dbInsertCampaign = async (
  campaign: PostCampaign,
  accountId: string
): Promise<Result<FullCampaignDetails>> => {
  return handleTransaction(async (tx) => {
    const insertedCampaign = unwrapResultOrError(
      await sqlInsertCampaign(tx, campaign)
    );
    const insertedMember = unwrapResultOrError(
      await sqlInsertCampaignMember(tx, insertedCampaign.id, accountId, "GM")
    );
    return wrapSuccessResult({
      campaign: insertedCampaign,
      invites: [],
      members: [insertedMember],
      entities: [],
    });
  });
};

export const dbFetchCampaignRole = async (
  campaignId: string,
  accountId: string
): Promise<Result<CampaignRole>> => {
  return await sqlFetchCampaignRole(pool, campaignId, accountId);
};

export const dbListCampaigns = async (
  accountId: string
): Promise<Result<CampaignWithRole[]>> => {
  return await sqlListCampaignsForAccount(pool, accountId);
};

export const dbFetchFullCampaignDetails = async (
  campaignId: string,
  role: CampaignRole
): Promise<Result<FullCampaignDetails>> => {
  const gmView = role === "GM";
  const [campaign, invites, members, entities] = await Promise.all([
    unwrapResultOrError(await sqlFetchCampaignById(pool, campaignId)),
    gmView
      ? unwrapResultOrError(
          await sqlFetchCampaignInvitesByCampaignId(pool, campaignId)
        )
      : [],
    unwrapResultOrError(
      await sqlFetchCampaignMembersByCampaignId(pool, campaignId)
    ),
    unwrapResultOrError(
      await sqlFetchCampaignEntitiesByCampaignId(pool, campaignId, gmView)
    ),
  ]);
  return wrapSuccessResult({
    campaign,
    invites,
    members,
    entities,
  });
};

export const dbInsertCampaignEntity = async (
  campaignId: string,
  campaignEntity: PostCampaignEntity,
  role: CampaignRole
): Promise<Result<CampaignEntity>> => {
  if (role !== "GM" && campaignEntity.gm_only) {
    return UNAUTHORIZED_RESULT;
  }
  return sqlInsertCampaignEntity(
    pool,
    campaignId,
    campaignEntity.entity_id,
    campaignEntity.gm_only
  );
};

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
