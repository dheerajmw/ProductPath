import { z } from "zod";

export const platformRoleSchema = z.enum([
  "CANDIDATE",
  "RECRUITER",
  "ADMIN",
  "REVIEWER",
]);

export const publicUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  platformRole: platformRoleSchema,
  emailVerified: z.boolean(),
  createdAt: z.string().datetime(),
});

export type PublicUser = z.infer<typeof publicUserSchema>;
