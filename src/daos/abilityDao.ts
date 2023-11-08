import {
  ComputedAttributes,
  FullEntityAbility,
  OptionalComputedAttributesResponse,
  PartialEntityAbility,
  PatchAbilityResponse,
  PostAbilitiesResponse,
  Result,
  UncompleteEntityAbility,
  computeAttributes,
} from "vennt-library";
import {
  FORBIDDEN_RESULT,
  ResultError,
  handleTransaction,
  unwrapResultOrError,
  wrapSuccessResult,
} from "../utils/db";
import pool from "../utils/pool";
import {
  sqlDeleteAbility,
  sqlFetchAbilityById,
  sqlInsertAbilities,
  sqlUpdateAbility,
  sqlUpdateEntityComputedAttributes,
  sqlValidateAccountCanEditEntity,
} from "./sql";
import { skimDownAbility } from "vennt-library";
import { fetchEntityFromCache, updateEntityInCache } from "../logic/functionalEntityCache";
import { randomUUID } from "crypto";

export const dbInsertAbilities = async (
  entityId: string,
  abilities: UncompleteEntityAbility[]
): Promise<Result<PostAbilitiesResponse>> => {
  let computedAttributes: ComputedAttributes | undefined = undefined;
  const fullAbilities = abilities.map((ability): FullEntityAbility => ({...ability, entity_id: entityId, id: randomUUID()}))
  const newFunctionalAbilities = fullAbilities
    .filter((ability) => ability.uses)
    .map(skimDownAbility) as FullEntityAbility[];
  if (newFunctionalAbilities.length > 0) {
    const cachedEntity = await fetchEntityFromCache(entityId);
    cachedEntity.abilities.push(...newFunctionalAbilities)
    updateEntityInCache(entityId, cachedEntity);computedAttributes = computeAttributes(cachedEntity);
    await sqlUpdateEntityComputedAttributes(pool, entityId, computedAttributes);
  }

  const [insertedAbilities, updatedAttrs] = await Promise.all([
    unwrapResultOrError(await sqlInsertAbilities(pool, fullAbilities)),
    computedAttributes ? unwrapResultOrError(await sqlUpdateEntityComputedAttributes(pool, entityId, computedAttributes)) : undefined
  ])
  return wrapSuccessResult({abilities: insertedAbilities, computed_attributes: updatedAttrs})
};

export const dbUpdateAbility = (
  partialAbility: PartialEntityAbility,
  abilityId: string,
  accountId: string,
  campaignId?: string
): Promise<Result<PatchAbilityResponse>> => {
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
    const newAbility = { ...currentAbility, ...partialAbility };

    let updatedAttrs: ComputedAttributes | undefined = undefined
    const functionalKeys: Array<keyof PartialEntityAbility> = ["active", "custom_fields", "name", "uses"];
    if ((currentAbility.uses || newAbility.uses) && functionalKeys.some((key) => key in partialAbility)) {
      const cachedEntity = await fetchEntityFromCache(currentAbility.entity_id);
      const newAbilities = cachedEntity.abilities.filter((ability) => (ability as FullEntityAbility).id !== abilityId).concat([skimDownAbility(newAbility)]);
      cachedEntity.abilities = newAbilities;
      updateEntityInCache(currentAbility.entity_id, cachedEntity);
    const computedAttributes = computeAttributes(cachedEntity);
    updatedAttrs = unwrapResultOrError(await sqlUpdateEntityComputedAttributes(tx, currentAbility.entity_id, computedAttributes));
    }

    const updatedAbility =unwrapResultOrError( await sqlUpdateAbility(tx, abilityId, newAbility));
    return wrapSuccessResult({ability: updatedAbility, computed_attributes: updatedAttrs})
  });
};

export const dbDeleteAbility = (
  abilityId: string,
  accountId: string,
  campaignId?: string
): Promise<Result<OptionalComputedAttributesResponse>> => {
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

    let updatedAttrs: ComputedAttributes | undefined = undefined
    if (ability.uses) {
      const cachedEntity = await fetchEntityFromCache(ability.entity_id);
      const newAbilities = cachedEntity.abilities.filter((ability) => (ability as FullEntityAbility).id !== abilityId)
      cachedEntity.abilities = newAbilities;
      updateEntityInCache(ability.entity_id, cachedEntity);
    const computedAttributes = computeAttributes(cachedEntity);
    updatedAttrs = unwrapResultOrError(await sqlUpdateEntityComputedAttributes(tx, ability.entity_id, computedAttributes));
    }

    await sqlDeleteAbility(tx, abilityId)
    return wrapSuccessResult({computed_attributes: updatedAttrs})
  });
};
