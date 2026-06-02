import { z } from "zod";

export const selectRoleSchema = z.object({
  roleId: z.string().min(1),
  confirmArchive: z.boolean().optional(),
});

export const toggleResourceSchema = z.object({
  completed: z.boolean(),
});

export const roadmapBodySchema = z.object({
  roleId: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  published: z.boolean().optional(),
});

export const moduleBodySchema = z.object({
  roadmapId: z.string().min(1),
  slug: z.string().min(1).max(100),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  sortOrder: z.number().int().optional(),
  prerequisiteIds: z.array(z.string()).optional(),
});

export const resourceBodySchema = z.object({
  moduleId: z.string().min(1),
  title: z.string().min(1).max(200),
  type: z.enum(["ARTICLE", "VIDEO", "PDF", "EXTERNAL_LINK"]),
  url: z.string().url().optional().nullable(),
  content: z.string().max(10000).optional().nullable(),
  required: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});
