import {
  FORBIDDEN_RESULT,
  ResultError,
  handleTransaction,
  unwrapResultOrError,
  wrapSuccessResult,
} from "../utils/db";
import pool from "../utils/pool";
import {
  ComputedAttributes,
  FullEntityItem,
  OptionalComputedAttributesResponse,
  PartialEntityItem,
  PatchItemResponse,
  PostItemsResponse,
  Result,
  UncompleteEntityItem,
  computeAttributes,
  skimDownItem,
} from "vennt-library";
import {
  sqlDeleteItem,
  sqlFetchItemById,
  sqlInsertItems,
  sqlUpdateEntityComputedAttributes,
  sqlUpdateItem,
  sqlValidateAccountCanEditEntity,
} from "./sql";
import { randomUUID } from "crypto";
import {
  fetchEntityFromCache,
  updateEntityInCache,
} from "../logic/functionalEntityCache";

export const dbInsertItems = async (
  entityId: string,
  items: UncompleteEntityItem[]
): Promise<Result<PostItemsResponse>> => {
  let computedAttributes: ComputedAttributes | undefined = undefined;
  const fullItems = items.map(
    (item): FullEntityItem => ({
      ...item,
      entity_id: entityId,
      id: randomUUID(),
    })
  );
  const newFunctionalItems = fullItems
    .filter((ability) => ability.uses)
    .map(skimDownItem) as FullEntityItem[];
  if (newFunctionalItems.length > 0) {
    const cachedEntity = await fetchEntityFromCache(entityId);
    cachedEntity.items.push(...newFunctionalItems);
    updateEntityInCache(entityId, cachedEntity);
    computedAttributes = computeAttributes(cachedEntity);
  }

  const [insertedItems, updatedAttrs] = await Promise.all([
    unwrapResultOrError(await sqlInsertItems(pool, fullItems)),
    computedAttributes
      ? unwrapResultOrError(
          await sqlUpdateEntityComputedAttributes(
            pool,
            entityId,
            computedAttributes
          )
        )
      : undefined,
  ]);
  return wrapSuccessResult({
    items: insertedItems,
    computed_attributes: updatedAttrs,
  });
};

export const dbUpdateItem = (
  partialItem: PartialEntityItem,
  itemId: string,
  accountId: string,
  campaignId?: string
): Promise<Result<PatchItemResponse>> => {
  return handleTransaction(async (tx) => {
    const currentItem = unwrapResultOrError(
      await sqlFetchItemById(tx, itemId, true)
    );
    const permission = unwrapResultOrError(
      await sqlValidateAccountCanEditEntity(
        tx,
        accountId,
        currentItem.entity_id,
        campaignId
      )
    );
    if (!permission) {
      throw new ResultError(FORBIDDEN_RESULT);
    }
    const newItem = { ...currentItem, ...partialItem };

    let updatedAttrs: ComputedAttributes | undefined = undefined;
    const functionalKeys: Array<keyof PartialEntityItem> = [
      "active",
      "custom_fields",
      "name",
      "type",
      "uses",
    ];
    if (
      (currentItem.uses || newItem.uses) &&
      functionalKeys.some((key) => key in partialItem)
    ) {
      const cachedEntity = await fetchEntityFromCache(
        currentItem.entity_id,
        tx
      );
      const newItems = cachedEntity.items
        .filter((ability) => (ability as FullEntityItem).id !== itemId)
        .concat([skimDownItem(newItem)]);
      cachedEntity.items = newItems;
      updateEntityInCache(currentItem.entity_id, cachedEntity);
      const computedAttributes = computeAttributes(cachedEntity);
      updatedAttrs = unwrapResultOrError(
        await sqlUpdateEntityComputedAttributes(
          tx,
          currentItem.entity_id,
          computedAttributes
        )
      );
    }

    const updatedItem = unwrapResultOrError(
      await sqlUpdateItem(tx, itemId, newItem)
    );
    return wrapSuccessResult({
      item: updatedItem,
      computed_attributes: updatedAttrs,
    });
  });
};

export const dbDeleteItem = (
  itemId: string,
  accountId: string,
  campaignId?: string
): Promise<Result<OptionalComputedAttributesResponse>> => {
  return handleTransaction(async (tx) => {
    const item = unwrapResultOrError(await sqlFetchItemById(tx, itemId, true));
    const permission = unwrapResultOrError(
      await sqlValidateAccountCanEditEntity(
        tx,
        accountId,
        item.entity_id,
        campaignId
      )
    );
    if (!permission) {
      throw new ResultError(FORBIDDEN_RESULT);
    }

    let updatedAttrs: ComputedAttributes | undefined = undefined;
    if (item.uses) {
      const cachedEntity = await fetchEntityFromCache(item.entity_id, tx);
      const newItems = cachedEntity.items.filter(
        (ability) => (ability as FullEntityItem).id !== itemId
      );
      cachedEntity.items = newItems;
      updateEntityInCache(item.entity_id, cachedEntity);
      const computedAttributes = computeAttributes(cachedEntity);
      updatedAttrs = unwrapResultOrError(
        await sqlUpdateEntityComputedAttributes(
          tx,
          item.entity_id,
          computedAttributes
        )
      );
    }

    await sqlDeleteItem(tx, itemId);
    return wrapSuccessResult({ computed_attributes: updatedAttrs });
  });
};
