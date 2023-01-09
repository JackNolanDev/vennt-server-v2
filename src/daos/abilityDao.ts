import {
  ResultError,
  handleTransaction,
  unwrapResultOrError,
  wrapErrorResult,
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
  sqlFetchAbilityOwnerById,
  sqlFetchAbilityWithOwnerById,
  sqlInsertAbilities,
  sqlUpdateAbility,
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
  owner: string
): Promise<Result<FullEntityAbility>> => {
  return handleTransaction(async (tx) => {
    const currentAbility = unwrapResultOrError(
      await sqlFetchAbilityWithOwnerById(tx, abilityId)
    );
    if (currentAbility.owner !== owner) {
      throw new ResultError(wrapErrorResult("Forbidden", 403));
    }
    const updatedAbility = { ...currentAbility, ...partialAbility };
    return sqlUpdateAbility(tx, abilityId, updatedAbility);
  });
};

export const dbDeleteAbility = (
  abilityId: string,
  owner: string
): Promise<Result<boolean>> => {
  return handleTransaction(async (tx) => {
    const abilityOwner = unwrapResultOrError(
      await sqlFetchAbilityOwnerById(tx, abilityId)
    );
    if (abilityOwner !== owner) {
      throw new ResultError(wrapErrorResult("Forbidden", 403));
    }
    return sqlDeleteAbility(tx, abilityId);
  });
};
