import { PoolClient, QueryResult } from "pg";
import pool from "./pool";
import { ErrorResult, Result, SuccessResult } from "./types";

export const parseFirst = <T>(
  queryRes: QueryResult,
  errorCode = 404
): Result<T> => {
  const first = queryRes.rows[0];
  if (first !== undefined) {
    return wrapSuccessResult(first as T);
  }
  return wrapErrorResult("Not found", errorCode);
};

export const parseList = <T>(queryRes: QueryResult): Result<T[]> => {
  return wrapSuccessResult(queryRes.rows as T[]);
};

export const parseFirstVal = <T>(
  queryRes: QueryResult,
  errorCode = 404
): Result<T> => {
  const first = queryRes.rows[0];
  if (typeof first === "object") {
    const firstVals = Object.values(first);
    if (firstVals[0] !== undefined) {
      return wrapSuccessResult(firstVals[0] as T);
    }
  }
  return wrapErrorResult("Not found", errorCode);
};

export class ResultError extends Error {
  result: ErrorResult;

  constructor(err: ErrorResult) {
    super(err.error);
    this.result = err;
  }
}

export const handleTransaction = async <T>(
  sql: (tx: PoolClient) => Promise<Result<T>>
): Promise<Result<T>> => {
  const client = await pool.connect();
  let res = undefined;

  try {
    await client.query("BEGIN");
    res = await sql(client);
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    if (e instanceof ResultError) {
      // catch custom errors
      res = e.result;
    } else {
      throw e;
    }
  } finally {
    client.release();
  }
  return res;
};

export const unwrapResultOrError = <T>(result: Result<T>): T => {
  if (result.success) {
    return result.result;
  }
  throw new ResultError(result);
};

export const wrapSuccessResult = <T>(result: T): SuccessResult<T> => {
  return {
    success: true,
    result,
  };
};

export const wrapErrorResult = (error: string, code: number): ErrorResult => {
  return {
    success: false,
    error,
    code,
  };
};

export const FORBIDDEN_RESULT = wrapErrorResult("Forbidden", 403);
