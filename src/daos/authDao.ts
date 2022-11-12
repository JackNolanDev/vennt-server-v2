import bcrypt from "bcrypt";
import { parseFirst } from "../utils/db";
import pool from "../utils/pool";
import {
  AccountInfo,
  accountInfoValidator,
  dangerousAccountInfoValidator,
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
  return parseFirst(res, accountInfoValidator, 500);
};

export const verifyPassword = async (
  loginRequest: LoginRequest
): Promise<Result<AccountInfo>> => {
  const res = await pool.query(
    "SELECT id, username, email, role, password FROM vennt.accounts WHERE username = $1",
    [loginRequest.username]
  );
  const row = parseFirst(res, dangerousAccountInfoValidator, 500);
  if (row.success) {
    const comp = await bcrypt.compare(
      loginRequest.password,
      row.result.password
    );
    if (comp) {
      return { success: true, result: { id: row.result.id, username: row.result.username, email: row.result.email, role: row.result.role } };
    }
    return { success: false, error: "Incorrect password entered", code: 403 };
  }
  return row;
};
