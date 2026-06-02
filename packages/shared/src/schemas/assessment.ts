import { z } from "zod";

export const saveAnswerSchema = z.object({
  questionId: z.string().min(1),
  selectedIndex: z.number().int().min(0),
  currentQuestionIndex: z.number().int().min(0).optional(),
});

export const questionBodySchema = z.object({
  assessmentId: z.string().min(1),
  skillId: z.string().min(1),
  prompt: z.string().min(1).max(2000),
  options: z.array(z.string().min(1).max(500)).min(2).max(6),
  correctIndex: z.number().int().min(0),
  sortOrder: z.number().int().optional(),
});
