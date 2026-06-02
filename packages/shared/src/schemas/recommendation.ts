import { z } from "zod";

export const skillMappingItemSchema = z.object({
  skillId: z.string().min(1),
  moduleId: z.string().min(1),
  priority: z.number().int().min(0).optional(),
});

export const skillMappingsBodySchema = z.object({
  mappings: z.array(skillMappingItemSchema).min(1),
});
