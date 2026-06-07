import type { User } from "@/lib/api";

export function isValidUser(value: unknown): value is User {
  if (!value || typeof value !== "object") return false;
  const u = value as User;
  return typeof u.id === "string" && u.id.length > 0 && typeof u.email === "string";
}

export function toAuthDebugUser(user: User | null | undefined) {
  if (!isValidUser(user)) return null;
  return { id: user.id, email: user.email };
}
