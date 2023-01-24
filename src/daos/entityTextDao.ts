import { wrapSuccessResult } from "../utils/db";
import pool from "../utils/pool";
import {
  EntityTextKey,
  FullEntityText,
  Result,
  UncompleteEntityText,
} from "../utils/types";
import {
  sqlDeleteEntityText,
  sqlInsertEntityText,
  sqlUpdateEntityText,
  sqlUpdateEntityTextPermission,
} from "./sql";

export const dbInsertEntityText = async (
  entityId: string,
  text: UncompleteEntityText
): Promise<Result<FullEntityText>> => {
  const result = await sqlInsertEntityText(pool, entityId, [text]);
  return result.success ? wrapSuccessResult(result.result[0]) : result;
};

export const dbUpdateEntityText = (
  entityId: string,
  key: EntityTextKey,
  text: string
): Promise<Result<boolean>> => {
  return sqlUpdateEntityText(pool, entityId, key, text);
};

export const dbUpdateEntityTextPermission = (
  entityId: string,
  key: EntityTextKey,
  permission: boolean
): Promise<Result<boolean>> => {
  return sqlUpdateEntityTextPermission(pool, entityId, key, permission);
};

export const dbDeleteEntityText = (
  entityId: string,
  key: EntityTextKey
): Promise<Result<boolean>> => {
  return sqlDeleteEntityText(pool, entityId, key);
};
