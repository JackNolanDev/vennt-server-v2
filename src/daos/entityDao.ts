import {
  handleTransaction,
  wrapErrorResult,
  wrapSuccessResult,
  unwrapResultOrError,
  FORBIDDEN_RESULT,
} from "../utils/db";
import pool from "../utils/pool";
import {
  FullCollectedEntity,
  Result,
  FullEntity,
  UpdateEntityAttributes,
  UncompleteEntityChangelog,
  EntityAttribute,
  FullEntityChangelog,
  UncompleteCollectedEntityWithChangelog,
  PartialEntity,
  FullCollectedEntityWithChangelog,
  CAMPAIGN_ROLE_GM,
  skimDownEntity,
  CollectedEntity,
  computeAttributes,
  ComputedAttributes,
  FullEntityAbility,
  FullEntityItem,
} from "vennt-library";
import {
  TX,
  sqlDeleteEntity,
  sqlFetchAbilitiesByEntityId,
  sqlFetchChangelogByEntityId,
  sqlFetchChangelogByEntityIdAttribute,
  sqlFetchEntityById,
  sqlFetchEntityPermissions,
  sqlFetchEntityTextByEntityId,
  sqlFetchFluxByEntityId,
  sqlFetchFunctionalAbilitiesByEntityId,
  sqlFetchFunctionalItemsByEntityId,
  sqlFetchItemsByEntityId,
  sqlFilterChangelog,
  sqlInsertAbilities,
  sqlInsertChangelog,
  sqlInsertEntity,
  sqlInsertEntityText,
  sqlInsertFlux,
  sqlInsertItems,
  sqlListEntities,
  sqlUpdateEntity,
  sqlUpdateEntityAttributes,
  sqlValidateAccountCanEditEntity,
} from "./sql";
import {
  fetchEntityFromCache,
  updateEntityInCache,
} from "../logic/functionalEntityCache";
import { randomUUID } from "crypto";

export const dbInsertCollectedEntity = async (
  collected: UncompleteCollectedEntityWithChangelog,
  owner: string
): Promise<Result<FullCollectedEntity>> => {
  if (
    collected.abilities.length > 100 ||
    collected.changelog.length > 100 ||
    collected.items.length > 100
  ) {
    return wrapErrorResult("trying to insert too much on initial insert", 400);
  }
  const computedAttributes = computeAttributes(collected);
  return handleTransaction(async (tx) => {
    const entity = unwrapResultOrError(
      await sqlInsertEntity(tx, owner, {
        ...collected.entity,
        computed_attributes: computedAttributes,
      })
    );
    const abilities = unwrapResultOrError(
      await sqlInsertAbilities(tx, collected.abilities.map((ability): FullEntityAbility => ({...ability, entity_id: entity.id, id: randomUUID()})))
    );
    const items = unwrapResultOrError(
      await sqlInsertItems(tx, collected.items.map((item): FullEntityItem => ({...item, entity_id: entity.id, id: randomUUID()})))
    );
    const text = unwrapResultOrError(
      await sqlInsertEntityText(tx, entity.id, collected.text)
    );
    const flux = unwrapResultOrError(
      await sqlInsertFlux(tx, entity.id, collected.flux)
    );
    unwrapResultOrError(
      await sqlInsertChangelog(tx, entity.id, collected.changelog)
    );

    return wrapSuccessResult({
      entity,
      abilities,
      items,
      text,
      flux,
    });
  });
};

export const dbListEntities = async (
  owner: string
): Promise<Result<FullEntity[]>> => {
  return sqlListEntities(pool, owner);
};

export const dbFetchCollectedEntity = async (
  id: string,
  publicOnly: boolean
): Promise<Result<FullCollectedEntity>> => {
  const [entity, abilities, items, text, flux] = await Promise.all([
    unwrapResultOrError(await sqlFetchEntityById(pool, id)),
    unwrapResultOrError(await sqlFetchAbilitiesByEntityId(pool, id)),
    unwrapResultOrError(await sqlFetchItemsByEntityId(pool, id)),
    unwrapResultOrError(
      await sqlFetchEntityTextByEntityId(pool, id, publicOnly)
    ),
    unwrapResultOrError(await sqlFetchFluxByEntityId(pool, id)),
  ]);

  return wrapSuccessResult({ entity, abilities, items, text, flux });
};

export const dbFetchCollectedEntityFull = async (
  id: string
): Promise<Result<FullCollectedEntityWithChangelog>> => {
  const baseEntity = unwrapResultOrError(
    await dbFetchCollectedEntity(id, false)
  );
  const entityChangelog = unwrapResultOrError(
    await sqlFetchChangelogByEntityId(pool, id)
  );
  return wrapSuccessResult({
    ...baseEntity,
    changelog: entityChangelog,
  });
};

export const dbFetchCollectedEntityFunctional = async (
  id: string,
  tx?: TX
): Promise<Result<CollectedEntity>> => {
  const db = tx ?? pool;
  const [entity, abilities, items] = await Promise.all([
    unwrapResultOrError(await sqlFetchEntityById(db, id)),
    unwrapResultOrError(await sqlFetchFunctionalAbilitiesByEntityId(db, id)),
    unwrapResultOrError(await sqlFetchFunctionalItemsByEntityId(db, id)),
  ]);

  return wrapSuccessResult(
    skimDownEntity({ entity, abilities, items, text: [], flux: [] })
  );
};

export const dbUserOwnsEntity = async (
  id: string,
  owner: string
): Promise<Result<boolean>> => {
  const entity = await sqlFetchEntityById(pool, id);
  if (!entity.success) return entity;

  return wrapSuccessResult(entity.result.owner === owner);
};

export const dbUserCanEditEntity = async (
  accountId: string,
  entityId: string,
  campaignId?: string
): Promise<Result<boolean>> => {
  return sqlValidateAccountCanEditEntity(pool, accountId, entityId, campaignId);
};

export const dbUserCanReadPublicOnlyFields = async (
  entityId: string,
  accountId?: string,
  campaignId?: string
): Promise<Result<boolean>> => {
  const campaignParams =
    accountId && campaignId ? { accountId, campaignId } : undefined;
  const res = unwrapResultOrError(
    await sqlFetchEntityPermissions(pool, entityId, campaignParams)
  );
  const entitySource = res.find((perm) => perm.source === "entities");
  if (!entitySource) {
    return FORBIDDEN_RESULT;
  }
  if (entitySource.result === accountId) {
    return wrapSuccessResult(false);
  }

  if (campaignId) {
    const campaignSource = res.find((perm) => perm.source === "campaigns");
    if (campaignSource) {
      return wrapSuccessResult(campaignSource.result !== CAMPAIGN_ROLE_GM);
    }
  }

  if (entitySource.public) {
    return wrapSuccessResult(true);
  }
  return FORBIDDEN_RESULT;
};

export const dbUpdateEntityAttributes = async (
  entityId: string,
  request: UpdateEntityAttributes
): Promise<Result<FullEntity>> => {
  return handleTransaction(async (tx) => {
    const cachedEntity = await fetchEntityFromCache(entityId, tx);
    let changelogRows: UncompleteEntityChangelog[] = [];
    if (request.message) {
      changelogRows = Object.keys(request.attributes).map((attrIn) => {
        const attr = attrIn as EntityAttribute;
        return {
          attr,
          msg: request.message ?? "",
          prev: cachedEntity.entity.attributes[attr],
        };
      });
    }

    const mergedAttributes = {
      ...cachedEntity.entity.attributes,
      ...request.attributes,
    };

    cachedEntity.entity.attributes = mergedAttributes;
    updateEntityInCache(entityId, cachedEntity);
    const computedAttributes = computeAttributes(cachedEntity);

    const updatedEntity = unwrapResultOrError(
      await sqlUpdateEntityAttributes(
        tx,
        entityId,
        mergedAttributes,
        computedAttributes
      )
    );
    unwrapResultOrError(await sqlInsertChangelog(tx, entityId, changelogRows));

    return wrapSuccessResult(updatedEntity);
  });
};

export const dbFilterChangelog = async (
  entityId: string,
  attributes: EntityAttribute[]
): Promise<Result<boolean>> => {
  return sqlFilterChangelog(pool, entityId, attributes);
};

export const dbFetchChangelogByEntityIdAttribute = async (
  entityId: string,
  attr: EntityAttribute
): Promise<Result<FullEntityChangelog[]>> => {
  return sqlFetchChangelogByEntityIdAttribute(pool, entityId, attr);
};

export const dbUpdateEntity = async (
  entityId: string,
  partialEntity: PartialEntity
): Promise<Result<FullEntity>> => {
  const functionalKeys: Array<keyof PartialEntity> = ["attributes", "type"];
  return handleTransaction(async (tx) => {
    let computedAttributes: ComputedAttributes | null = null;
    if (functionalKeys.some((key) => key in partialEntity)) {
      // functional change applied
      const cachedEntity = await fetchEntityFromCache(entityId, tx);
      if (partialEntity.attributes) {
        cachedEntity.entity.attributes = partialEntity.attributes;
      }
      if (partialEntity.type) {
        cachedEntity.entity.type = partialEntity.type;
      }
      updateEntityInCache(entityId, cachedEntity);
      computedAttributes = computeAttributes(cachedEntity);
    }
    const currentEntity = unwrapResultOrError(
      await sqlFetchEntityById(tx, entityId, true)
    );
    const updatedEntity = { ...currentEntity, ...partialEntity };
    return sqlUpdateEntity(tx, entityId, updatedEntity, computedAttributes);
  });
};

export const dbDeleteEntity = async (
  entityId: string
): Promise<Result<boolean>> => {
  return sqlDeleteEntity(pool, entityId);
};
