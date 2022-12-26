import { JsonStorageKey, Result } from "../utils/types";
import pool from "../utils/pool";
import { JSON_STORAGE_TABLE } from "./sql";
import { parseFirstVal, wrapErrorResult, wrapSuccessResult } from "../utils/db";

export const dbUpsertJSONDocument = async (
  key: JsonStorageKey,
  document: unknown
): Promise<Result<boolean>> => {
  await pool.query(
    `INSERT INTO ${JSON_STORAGE_TABLE} (key, json) 
    VALUES ($1, $2) 
    ON CONFLICT (key)
    DO UPDATE SET json = $2, updated = CURRENT_TIMESTAMP`,
    [key, JSON.stringify(document)]
  );
  return wrapSuccessResult(true);
};

export const dbGetJSONDocument = async <T>(
  key: JsonStorageKey
): Promise<Result<T>> => {
  const response = parseFirstVal<string>(
    await pool.query(`SELECT json FROM ${JSON_STORAGE_TABLE} WHERE key = $1`, [
      key,
    ]),
    "json"
  );
  if (response.success) {
    try {
      return wrapSuccessResult(JSON.parse(response.result));
    } catch (err) {
      return wrapErrorResult("invalid JSON in DB", 500);
    }
  }
  return response;
};
