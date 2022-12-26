import {
  ResultError,
  handleTransaction,
  unwrapResultOrError,
  wrapErrorResult,
} from "../utils/db";
import { FullEntityItem, PartialEntityItem, Result } from "../utils/types";
import {
  sqlDeleteItem,
  sqlFetchItemOwnerById,
  sqlFetchItemWithOwnerById,
  sqlUpdateItem,
} from "./sql";

export const dbUpdateItem = (
  partialItem: PartialEntityItem,
  itemId: string,
  owner: string
): Promise<Result<FullEntityItem>> => {
  return handleTransaction(async (tx) => {
    const currentItem = unwrapResultOrError(
      await sqlFetchItemWithOwnerById(tx, itemId)
    );
    if (currentItem.owner !== owner) {
      throw new ResultError(wrapErrorResult("Forbidden", 403));
    }
    const newItem = { ...currentItem, ...partialItem };
    return sqlUpdateItem(tx, itemId, newItem);
  });
};

export const dbDeleteItem = (
  itemId: string,
  owner: string
): Promise<Result<boolean>> => {
  return handleTransaction(async (tx) => {
    const itemOwner = unwrapResultOrError(
      await sqlFetchItemOwnerById(tx, itemId)
    );
    if (itemOwner !== owner) {
      throw new ResultError(wrapErrorResult("Forbidden", 403));
    }
    return sqlDeleteItem(tx, itemId);
  });
};
