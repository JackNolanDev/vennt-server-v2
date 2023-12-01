import {
  CampaignDesc,
  CampaignEntity,
  CampaignRole,
  CampaignWithRole,
  FullCampaignDetails,
  PostCampaign,
  PostCampaignEntity,
  Result,
} from "vennt-library";
import {
  sqlFetchCampaignById,
  sqlFetchCampaignEntitiesByCampaignId,
  sqlFetchCampaignInviteLinksByCampaignId,
  sqlFetchCampaignInvitesByCampaignId,
  sqlFetchCampaignMembersByCampaignId,
  sqlFetchCampaignRole,
  sqlInsertCampaign,
  sqlInsertCampaignEntity,
  sqlInsertCampaignMember,
  sqlListCampaignsForAccount,
  sqlRemoveCampaignEntity,
  sqlRemoveCampaignMember,
  sqlUpdateCampaignDesc,
  sqlUpdateCampaignMemberRole,
  sqlValidateCampaignHasGM,
} from "./sql";
import pool from "../utils/pool";
import {
  ResultError,
  UNAUTHORIZED_RESULT,
  handleTransaction,
  unwrapResultOrError,
  wrapErrorResult,
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
  const [campaign, invites, invite_links, members, entities] =
    await Promise.all([
      unwrapResultOrError(await sqlFetchCampaignById(pool, campaignId)),
      gmView
        ? unwrapResultOrError(
            await sqlFetchCampaignInvitesByCampaignId(pool, campaignId)
          )
        : undefined,
      gmView
        ? unwrapResultOrError(
            await sqlFetchCampaignInviteLinksByCampaignId(pool, campaignId)
          )
        : undefined,
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
    invite_links,
    members,
    entities,
  });
};

export const dbUpdateCampaignDesc = async (
  campaignId: string,
  desc: CampaignDesc
): Promise<Result<boolean>> => {
  return await sqlUpdateCampaignDesc(pool, campaignId, desc);
};

export const dbUpdateCampaignMemberRole = async (
  campaignId: string,
  memberId: string,
  newRole: CampaignRole
) => {
  return handleTransaction(async (tx) => {
    const updatedRole = unwrapResultOrError(
      await sqlUpdateCampaignMemberRole(tx, campaignId, memberId, newRole)
    );
    const hasGMs = unwrapResultOrError(
      await sqlValidateCampaignHasGM(tx, campaignId)
    );
    if (!hasGMs) {
      // throw to rollback transaction
      throw new ResultError(
        wrapErrorResult("This campaign needs at least 1 GM")
      );
    }
    return wrapSuccessResult(updatedRole);
  });
};

export const dbRemoveCampaignMember = async (
  campaignId: string,
  accountId: string
) => {
  return handleTransaction(async (tx) => {
    const updatedRole = unwrapResultOrError(
      await sqlRemoveCampaignMember(tx, campaignId, accountId)
    );
    const hasGMs = unwrapResultOrError(
      await sqlValidateCampaignHasGM(tx, campaignId)
    );
    if (!hasGMs) {
      // throw to rollback transaction
      throw new ResultError(
        wrapErrorResult("This campaign needs at least 1 GM")
      );
    }
    return wrapSuccessResult(updatedRole);
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

export const dbRemoveCampaignEntity = async (
  campaignId: string,
  entityId: string
): Promise<Result<boolean>> => {
  return sqlRemoveCampaignEntity(pool, campaignId, entityId);
};
