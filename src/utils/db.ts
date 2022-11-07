import { QueryResult } from "pg";
import { z } from "zod";
import { Result } from "./types";

export const parseFirst = <T extends z.ZodTypeAny>(
  queryRes: QueryResult,
  validator: T
): Result<z.infer<T>> => {
  const first = queryRes.rows[0];
  const res = validator.safeParse(first);
  if (res.success) {
    return {
      success: true,
      result: res.data,
    };
  }
  return {
    success: false,
    error: res.error.message,
    code: 500,
  };
};
