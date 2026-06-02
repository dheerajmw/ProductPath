import { z } from "zod";
import { FIELD_LIMITS } from "../constants";

export const signupSchema = z.object({
  email: z.string().email().max(FIELD_LIMITS.email).toLowerCase().trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(FIELD_LIMITS.password),
  displayName: z.string().max(FIELD_LIMITS.displayName).trim().optional(),
});

export const loginSchema = z.object({
  email: z.string().email().max(FIELD_LIMITS.email).toLowerCase().trim(),
  password: z.string().max(FIELD_LIMITS.password),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1),
});

export const changeEmailSchema = z.object({
  newEmail: z.string().email().max(FIELD_LIMITS.email).toLowerCase().trim(),
  password: z.string().max(FIELD_LIMITS.password),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
