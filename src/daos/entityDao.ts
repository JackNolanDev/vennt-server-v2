import {
  handleTransaction,
  wrapErrorResult,
  wrapSuccessResult,
  unwrapResultOrError,
  ResultError,
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
} from "../utils/types";
import {
  sqlFetchAbilitiesByEntityId,
  sqlFetchChangelogByEntityIdAttribute,
  sqlFetchEntityById,
  sqlFetchItemsByEntityId,
  sqlFilterChangelog,
  sqlInsertAbilities,
  sqlInsertChangelog,
  sqlInsertEntity,
  sqlInsertItems,
  sqlListEntities,
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

    return wrapSuccessResult({
      entity,
      abilities,
      items,
    });
  });
};

export const dbListEntities = async (
  owner: string
): Promise<Result<FullEntity[]>> => {
  return sqlListEntities(pool, owner);
};

export const dbFetchCollectedEntity = async (
  id: string
): Promise<Result<FullCollectedEntity>> => {
  const entity = await sqlFetchEntityById(pool, id);
  if (!entity.success) return entity;

  const abilities = await sqlFetchAbilitiesByEntityId(pool, id);
  if (!abilities.success) return abilities;

  const items = await sqlFetchItemsByEntityId(pool, id);
  if (!items.success) return items;

  return wrapSuccessResult({
    entity: entity.result,
    abilities: abilities.result,
    items: items.result,
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
      throw new ResultError(wrapErrorResult("Forbidden", 403));
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
