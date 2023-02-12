import bcrypt from "bcrypt";
import { ResultError, getFirst, wrapErrorResult } from "../utils/db";
import pool from "../utils/pool";
import {
  AccountInfo,
  DangerousAccountInfo,
  LoginRequest,
  SignupRequest,
} from "../utils/types";

const SALT_ROUNDS = 10;

export const createAccount = async (
  signupRequest: SignupRequest
): Promise<AccountInfo> => {
  const hashedPassword = await bcrypt.hash(signupRequest.password, SALT_ROUNDS);
  const res = await pool.query(
    "INSERT INTO vennt.accounts (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, role",
    [signupRequest.username, signupRequest.email, hashedPassword]
  );
  return getFirst(res, 500);
};

export const verifyPassword = async (
  loginRequest: LoginRequest
): Promise<AccountInfo> => {
  const res = await pool.query(
    "SELECT id, username, email, role, password FROM vennt.accounts WHERE username = $1",
    [loginRequest.username]
  );
  const row = getFirst<DangerousAccountInfo>(res, 403, "Incorrect password entered");
  const matches = await bcrypt.compare(
    loginRequest.password,
    row.password
  );
  if (matches) {
    return {
      id: row.id,
      username: row.username,
      email: row.email,
      role: row.role,
    };
  }
  throw new ResultError(wrapErrorResult("Incorrect password entered", 403))
};
