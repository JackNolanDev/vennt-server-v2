import {
  FORBIDDEN_RESULT,
  ResultError,
  handleTransaction,
  unwrapResultOrError,
} from "../utils/db";
import pool from "../utils/pool";
import {
  FullEntityAbility,
  PartialEntityAbility,
  Result,
  UncompleteEntityAbility,
} from "../utils/types";
import {
  sqlDeleteAbility,
  sqlFetchAbilityById,
  sqlInsertAbilities,
  sqlUpdateAbility,
  sqlValidateAccountCanEditEntity,
} from "./sql";

export const dbInsertAbilities = (
  entityId: string,
  abilities: UncompleteEntityAbility[]
): Promise<Result<FullEntityAbility[]>> => {
  return sqlInsertAbilities(pool, entityId, abilities);
};

export const dbUpdateAbility = (
  partialAbility: PartialEntityAbility,
  abilityId: string,
  accountId: string,
  campaignId?: string
): Promise<Result<FullEntityAbility>> => {
  return handleTransaction(async (tx) => {
    const currentAbility = unwrapResultOrError(
      await sqlFetchAbilityById(tx, abilityId, true)
    );
    const permission = unwrapResultOrError(
      await sqlValidateAccountCanEditEntity(
        tx,
        accountId,
        currentAbility.entity_id,
        campaignId
      )
    );
    if (!permission) {
      throw new ResultError(FORBIDDEN_RESULT);
    }
    const updatedAbility = { ...currentAbility, ...partialAbility };
    return sqlUpdateAbility(tx, abilityId, updatedAbility);
  });
};

export const dbDeleteAbility = (
  abilityId: string,
  accountId: string,
  campaignId?: string
): Promise<Result<boolean>> => {
  return handleTransaction(async (tx) => {
    const ability = unwrapResultOrError(
      await sqlFetchAbilityById(tx, abilityId, true)
    );
    const permission = unwrapResultOrError(
      await sqlValidateAccountCanEditEntity(
        tx,
        accountId,
        ability.entity_id,
        campaignId
      )
    );
    if (!permission) {
      throw new ResultError(FORBIDDEN_RESULT);
    }
    return sqlDeleteAbility(tx, abilityId);
  });
};
