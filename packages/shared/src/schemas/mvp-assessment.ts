import { z } from "zod";

export const roleSlugSchema = z.enum([
  "product-management",
  "product-design",
  "product-marketing",
  "product-analytics",
  "product-operations",
]);

export const difficultySchema = z.enum(["beginner", "intermediate"]);

export const startMvpAssessmentSchema = z.object({
  roleSlug: roleSlugSchema,
  difficulty: difficultySchema.default("beginner"),
});

export const submitMvpResponseSchema = z.object({
  questionId: z.string().min(1),
  selectedIndex: z.number().int().min(0).optional(),
  textAnswer: z.string().max(4000).optional(),
  currentIndex: z.number().int().min(0).optional(),
});

export type StartMvpAssessmentInput = z.infer<typeof startMvpAssessmentSchema>;
export type SubmitMvpResponseInput = z.infer<typeof submitMvpResponseSchema>;
