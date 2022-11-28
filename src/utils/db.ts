import { PoolClient, QueryResult } from "pg";
import { z } from "zod";
import pool from "./pool";
import { ErrorResult, Result, SuccessResult } from "./types";

export const parseFirst = <T extends z.ZodTypeAny>(
  queryRes: QueryResult,
  validator: T,
  errorCode = 404
): Result<z.infer<T>> => {
  const first = queryRes.rows[0];
  const parsed = validator.safeParse(first);
  if (parsed.success) {
    return wrapSuccessResult(parsed.data)
  }
  return wrapErrorResult(parsed.error.message, errorCode)
};

export const parseList = <T extends z.ZodTypeAny>(queryRes: QueryResult,
  validator: T,
  errorCode = 404): Result<z.infer<T>[]> => {
    const parsed: z.infer<T>[] = [];
    for (const row of queryRes.rows) {
      const parsedRow = validator.safeParse(row);
      if (parsedRow.success) {
        parsed.push(parsedRow.data);
      } else {
        return wrapErrorResult(parsedRow.error.message, errorCode)
      }
    }
    return wrapSuccessResult(parsed)
  }

export const handleTransaction = async <T>(sql: (tx: PoolClient) => Promise<T>): Promise<T> => {
  const client = await pool.connect()
  let res = undefined;
 
  try {
    await client.query('BEGIN')
    res = await sql(client)
    await client.query('COMMIT')
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
  return res;
}

export const wrapSuccessResult = <T>(result: T): SuccessResult<T> => {
  return {
    success: true,
    result,
  }
}

export const wrapErrorResult = (error: string, code: number): ErrorResult => {
  return {
    success: false,
    error,
    code,
  };
}
