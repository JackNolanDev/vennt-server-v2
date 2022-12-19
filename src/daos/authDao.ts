import bcrypt from "bcrypt";
import { parseFirst, wrapErrorResult, wrapSuccessResult } from "../utils/db";
import pool from "../utils/pool";
import {
  AccountInfo,
  DangerousAccountInfo,
  LoginRequest,
  Result,
  SignupRequest,
} from "../utils/types";

const SALT_ROUNDS = 10;

export const createAccount = async (
  signupRequest: SignupRequest
): Promise<Result<AccountInfo>> => {
  const hashedPassword = await bcrypt.hash(signupRequest.password, SALT_ROUNDS);
  const res = await pool.query(
    "INSERT INTO vennt.accounts (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, role",
    [signupRequest.username, signupRequest.email, hashedPassword]
  );
  return parseFirst(res, 500);
};

export const verifyPassword = async (
  loginRequest: LoginRequest
): Promise<Result<AccountInfo>> => {
  const res = await pool.query(
    "SELECT id, username, email, role, password FROM vennt.accounts WHERE username = $1",
    [loginRequest.username]
  );
  const row = parseFirst<DangerousAccountInfo>(res, 500);
  if (row.success) {
    const comp = await bcrypt.compare(
      loginRequest.password,
      row.result.password
    );
    if (comp) {
      return wrapSuccessResult({
        id: row.result.id,
        username: row.result.username,
        email: row.result.email,
        role: row.result.role,
      });
    }
    return wrapErrorResult("Incorrect password entered", 403);
  }
  return wrapErrorResult("Incorrect password entered", 403);
};
