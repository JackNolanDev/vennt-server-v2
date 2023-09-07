import {
  FORBIDDEN_RESULT,
  ResultError,
  handleTransaction,
  unwrapResultOrError,
} from "../utils/db";
import pool from "../utils/pool";
import {
  FullEntityItem,
  PartialEntityItem,
  Result,
  UncompleteEntityItem,
} from "../utils/types";
import {
  sqlDeleteItem,
  sqlFetchItemById,
  sqlInsertItems,
  sqlUpdateItem,
  sqlValidateAccountCanEditEntity,
} from "./sql";

export const dbInsertItems = (
  entityId: string,
  items: UncompleteEntityItem[]
): Promise<Result<FullEntityItem[]>> => {
  return sqlInsertItems(pool, entityId, items);
};

export const dbUpdateItem = (
  partialItem: PartialEntityItem,
  itemId: string,
  accountId: string,
  campaignId?: string
): Promise<Result<FullEntityItem>> => {
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
    return sqlUpdateItem(tx, itemId, newItem);
  });
};

export const dbDeleteItem = (
  itemId: string,
  accountId: string,
  campaignId?: string
): Promise<Result<boolean>> => {
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
    return sqlDeleteItem(tx, itemId);
  });
};
