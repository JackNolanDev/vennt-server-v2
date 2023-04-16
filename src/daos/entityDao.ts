import {
  handleTransaction,
  wrapErrorResult,
  wrapSuccessResult,
  unwrapResultOrError,
  ResultError,
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
} from "../utils/types";
import {
  sqlDeleteEntity,
  sqlFetchAbilitiesByEntityId,
  sqlFetchChangelogByEntityId,
  sqlFetchChangelogByEntityIdAttribute,
  sqlFetchEntityById,
  sqlFetchEntityTextByEntityId,
  sqlFetchFluxByEntityId,
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
} from "./sql";

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
  return handleTransaction(async (tx) => {
    const entity = unwrapResultOrError(
      await sqlInsertEntity(tx, owner, collected.entity)
    );
    const abilities = unwrapResultOrError(
      await sqlInsertAbilities(tx, entity.id, collected.abilities)
    );
    unwrapResultOrError(
      await sqlInsertChangelog(tx, entity.id, collected.changelog)
    );
    const items = unwrapResultOrError(
      await sqlInsertItems(tx, entity.id, collected.items)
    );
    const text = unwrapResultOrError(
      await sqlInsertEntityText(tx, entity.id, collected.text)
    );
    const flux = unwrapResultOrError(
      await sqlInsertFlux(tx, entity.id, collected.flux)
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
  user?: string
): Promise<Result<FullCollectedEntity>> => {
  const entity = await sqlFetchEntityById(pool, id);
  if (!entity.success) return entity;
  if (!entity.result.public && entity.result.owner !== user) {
    return FORBIDDEN_RESULT;
  }

  const abilities = await sqlFetchAbilitiesByEntityId(pool, id);
  if (!abilities.success) return abilities;

  const items = await sqlFetchItemsByEntityId(pool, id);
  if (!items.success) return items;

  const text = await sqlFetchEntityTextByEntityId(
    pool,
    id,
    entity.result.owner !== user
  );
  if (!text.success) return text;

  const flux = await sqlFetchFluxByEntityId(pool, id);
  if (!flux.success) return flux;

  return wrapSuccessResult({
    entity: entity.result,
    abilities: abilities.result,
    items: items.result,
    text: text.result,
    flux: flux.result,
  });
};

export const dbFetchCollectedEntityFull = async (
  id: string,
  user?: string
): Promise<Result<FullCollectedEntityWithChangelog>> => {
  const baseEntity = unwrapResultOrError(
    await dbFetchCollectedEntity(id, user)
  );
  const entityChangelog = unwrapResultOrError(
    await sqlFetchChangelogByEntityId(pool, id)
  );
  return wrapSuccessResult({
    ...baseEntity,
    changelog: entityChangelog,
  });
};

export const dbUserOwnsEntity = async (
  id: string,
  owner: string
): Promise<Result<boolean>> => {
  const entity = await sqlFetchEntityById(pool, id);
  if (!entity.success) return entity;

  return wrapSuccessResult(entity.result.owner === owner);
};

export const dbUpdateEntityAttributes = async (
  entityId: string,
  request: UpdateEntityAttributes,
  userId: string
): Promise<Result<FullEntity>> => {
  return handleTransaction(async (tx) => {
    const entity = unwrapResultOrError(await sqlFetchEntityById(tx, entityId));
    if (entity.owner !== userId) {
      throw new ResultError(FORBIDDEN_RESULT);
    }

    let changelogRows: UncompleteEntityChangelog[] = [];
    if (request.message) {
      changelogRows = Object.keys(request.attributes).map((attrIn) => {
        const attr = attrIn as EntityAttribute;
        return {
          attr,
          msg: request.message ?? "",
          prev: entity.attributes[attr],
        };
      });
    }

    entity.attributes = { ...entity.attributes, ...request.attributes };

    const updatedEntity = unwrapResultOrError(
      await sqlUpdateEntityAttributes(tx, entity.id, entity.attributes)
    );
    unwrapResultOrError(await sqlInsertChangelog(tx, entity.id, changelogRows));

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
  user: string,
  partialEntity: PartialEntity
): Promise<Result<FullEntity>> => {
  return handleTransaction(async (tx) => {
    const currentEntity = unwrapResultOrError(
      await sqlFetchEntityById(tx, entityId)
    );
    if (currentEntity.owner !== user) {
      throw new ResultError(FORBIDDEN_RESULT);
    }
    const updatedEntity = { ...currentEntity, ...partialEntity };
    return sqlUpdateEntity(tx, entityId, updatedEntity);
  });
};

export const dbDeleteEntity = async (
  entityId: string
): Promise<Result<boolean>> => {
  return sqlDeleteEntity(pool, entityId);
};
