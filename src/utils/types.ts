import { z } from "zod";

const NAME_MAX = 100;
const PASSWORD_MAX = 2000;

// GENERAL FIELDS

const idValidator = z.string().uuid();

// ACCOUNT FIELDS

const usernameValidator = z.string().max(NAME_MAX);
const emailValidator = z.string().email();
const passwordValidator = z.string().max(PASSWORD_MAX);
const roleValidator = z.enum(["USER", "ADMIN"]);

export const signupRequestValidator = z.object({
  username: usernameValidator,
  email: emailValidator,
  password: passwordValidator,
});

export const loginRequestValidator = z.object({
  username: usernameValidator,
  password: passwordValidator,
})

export const accountInfoValidator = z.object({
  id: idValidator,
  username: usernameValidator,
  email: emailValidator,
  role: roleValidator,
});

export const dangerousAccountInfoValidator = accountInfoValidator.extend({
  password: passwordValidator
});

export type SignupRequest = z.infer<typeof signupRequestValidator>;
export type LoginRequest = z.infer<typeof loginRequestValidator>;
export type AccountInfo = z.infer<typeof accountInfoValidator>;
export type DangerousAccountInfo = z.infer<typeof dangerousAccountInfoValidator>;

// SERVER TYPES

export type SuccessResult<T> = {
  success: true;
  result: T;
};
export type ErrorResult = {
  success: false;
  error: string;
  code: number;
};

export type Result<T> = SuccessResult<T> | ErrorResult;
