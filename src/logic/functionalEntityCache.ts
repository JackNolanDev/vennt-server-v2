import { CollectedEntity } from "vennt-library";
import { dbFetchCollectedEntityFunctional } from "../daos/entityDao";
import { unwrapResultOrError } from "../utils/db";
import { TX } from "../daos/sql";

const entityCache: Record<
  string,
  {
    updated: number;
    entity: CollectedEntity;
  }
> = {};
const MAX_CACHE_SIZE = 50;
const MAX_CACHE_AGE = 60 * 60 * 1000; // 1 hour

const removeOldestFromCache = () => {
  Object.entries(entityCache).forEach(([id, entry]) => {
    if (entry.updated < Date.now() - MAX_CACHE_AGE) {
      delete entityCache[id];
    }
  });
  while (Object.keys(entityCache).length >= MAX_CACHE_SIZE) {
    const entries = Object.entries(entityCache);
    let oldest: { id: string; updated: number } = {
      id: entries[0][0],
      updated: entries[0][1].updated,
    };
    entries.forEach(([id, entry]) => {
      if (entry.updated < oldest.updated) {
        oldest = { id, updated: entry.updated };
      }
    });
    delete entityCache[oldest.id];
  }
};

// Dev note: If moving to serverless platform, we can switch this logic out to use redis relatively easily
export const fetchEntityFromCache = async (
  entityId: string,
  tx?: TX
): Promise<CollectedEntity> => {
  const inMemory = entityCache[entityId];
  if (inMemory) {
    inMemory.updated = Date.now();
    return inMemory.entity;
  }

  removeOldestFromCache();

  const wrappedEntity = await dbFetchCollectedEntityFunctional(entityId, tx);
  const entity = unwrapResultOrError(wrappedEntity);
  entityCache[entityId] = { updated: Date.now(), entity };
  return entity;
};

export const updateEntityInCache = async (
  entityId: string,
  entity: CollectedEntity
) => {
  const inMemory = entityCache[entityId];
  if (inMemory) {
    inMemory.updated = Date.now();
    inMemory.entity = entity;
  }
};
