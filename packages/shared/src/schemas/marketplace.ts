import { z } from "zod";

export const recruiterSignupSchema = z.object({
  email: z.string().email().max(255).toLowerCase().trim(),
  password: z.string().min(8).max(128),
  company: z.string().min(1).max(200),
  companyDomain: z.string().min(3).max(200).optional(),
});

export const recruiterVerifySchema = z.object({
  companyDomain: z.string().min(3).max(200).optional(),
});

export const discoverySettingsSchema = z.object({
  discoverable: z.boolean(),
});

export const interestRequestSchema = z.object({
  candidateId: z.string().min(1),
  message: z.string().min(20).max(2000),
});

export const interestActionSchema = z.object({
  action: z.enum(["accept", "decline"]),
});

export const talentSearchSchema = z.object({
  roleSlug: z.string().optional(),
  q: z.string().max(100).optional(),
});
