import { z } from "zod";

export const createPostSchema = z.object({
  type: z.enum(["TEXT", "PROJECT_SHARE"]).default("TEXT"),
  body: z.string().min(1).max(5000),
  projectSubmissionId: z.string().min(1).optional(),
});

export const createCommentSchema = z.object({
  body: z.string().min(1).max(2000),
  parentId: z.string().min(1).optional(),
});

export const feedQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export const createReportSchema = z.object({
  targetType: z.enum(["POST", "COMMENT"]),
  targetId: z.string().min(1),
  reason: z.string().min(10).max(1000),
});

export const moderationActionSchema = z.object({
  action: z.enum(["hide_post", "dismiss"]),
  note: z.string().max(500).optional(),
});
