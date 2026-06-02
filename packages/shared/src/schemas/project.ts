import { z } from "zod";

export const artifactUrlSchema = z.object({
  type: z.literal("URL"),
  name: z.string().min(1).max(200),
  url: z.string().url().max(2000),
});

export const submissionBodySchema = z.object({
  templateId: z.string().min(1).optional(),
  title: z.string().min(1).max(200).optional(),
  narrative: z.string().max(50000).optional(),
  artifactUrls: z.array(artifactUrlSchema).max(10).optional(),
});

export const updateSubmissionSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  narrative: z.string().max(50000).optional(),
  artifactUrls: z.array(artifactUrlSchema).max(10).optional(),
});

export const reviewBodySchema = z.object({
  submissionId: z.string().min(1),
  decision: z.enum(["APPROVED", "REJECTED"]),
  feedback: z.string().min(1).max(10000),
  rubricScores: z.record(z.string(), z.number().min(0).max(5)),
});

export const projectTemplateBodySchema = z.object({
  roleId: z.string().min(1),
  slug: z.string().min(1).max(100),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  instructions: z.string().min(1).max(20000),
  rubric: z.object({
    criteria: z.array(
      z.object({
        key: z.string().min(1),
        label: z.string().min(1),
        required: z.boolean(),
        maxScore: z.number().int().min(1).max(10),
      }),
    ),
  }),
  published: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const ALLOWED_UPLOAD_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".md",
  ".txt",
  ".zip",
] as const;
