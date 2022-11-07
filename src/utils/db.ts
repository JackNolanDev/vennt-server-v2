import { QueryResult } from "pg";
import { z } from "zod";
import { Result } from "./types";

export const parseFirst = <T extends z.ZodTypeAny>(
  queryRes: QueryResult,
  validator: T,
  errorCode = 404
): Result<z.infer<T>> => {
  const first = queryRes.rows[0];
  const parsed = validator.safeParse(first);
  if (parsed.success) {
    return {
      success: true,
      result: parsed.data,
    };
  }
  return {
    success: false,
    error: parsed.error.message,
    code: errorCode,
  };
};
