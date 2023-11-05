import { PoolClient, QueryResult } from "pg";
import pool from "./pool";
import { ErrorResult, Result, SuccessResult } from "vennt-library";

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

export const getFirst = <T>(
  queryRes: QueryResult,
  errorCode = 404,
  errorMsg = "Not Found"
): T => {
  const first = queryRes.rows[0];
  if (first !== undefined) {
    return first as T;
  }
  throw new ResultError(wrapErrorResult(errorMsg, errorCode));
};

export const getList = <T>(queryRes: QueryResult): T[] => {
  return queryRes.rows as T[];
};

export const getFirstVal = <T>(
  queryRes: QueryResult,
  errorCode = 404,
  errorMsg = "Not Found"
): T => {
  const first = queryRes.rows[0];
  if (typeof first === "object") {
    const firstVals = Object.values(first);
    if (firstVals[0] !== undefined) {
      return firstVals[0] as T;
    }
  }
  throw new ResultError(wrapErrorResult(errorMsg, errorCode));
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

export const wrapErrorResult = (error: string, code = 400): ErrorResult => {
  return {
    success: false,
    error,
    code,
  };
};

export const throwErrorResult = (error: string, code = 400): void => {
  throw new ResultError(wrapErrorResult(error, code));
};

export const UNAUTHORIZED_RESULT = wrapErrorResult("Unauthorized", 401);
export const FORBIDDEN_RESULT = wrapErrorResult("Forbidden", 403);
export const NOT_FOUND_RESULT = wrapErrorResult("Not Found", 404);
export const SERVER_ERROR_RESULT = wrapErrorResult("Server Error", 500);
