import bcrypt from "bcrypt";
import { parseFirst } from "../utils/db";
import pool from "../utils/pool";
import { AccountInfo, accountInfoValidator, Result, SignupRequest } from "../utils/types";

const SALT_ROUNDS = 10;

export const createAccount = async (signupRequest: SignupRequest): Promise<Result<AccountInfo>> => {
  const hashedPassword = await bcrypt.hash(signupRequest.password, SALT_ROUNDS);
  const res = await pool.query("INSERT INTO vennt.accounts (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, role",
              [signupRequest.email, signupRequest.username, hashedPassword]);
  return parseFirst(res, accountInfoValidator);
}
