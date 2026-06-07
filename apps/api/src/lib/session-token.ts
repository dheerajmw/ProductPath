import type { Request } from "express";
import { SESSION_COOKIE } from "@productpath/shared";

/** Session token from httpOnly cookie (proxy) or Authorization: Bearer (SPA). */
export function getSessionTokenFromRequest(req: Request): string | undefined {
  const cookie = req.cookies?.[SESSION_COOKIE] as string | undefined;
  if (cookie) return cookie;

  const header = req.headers.authorization;
  if (typeof header === "string" && header.startsWith("Bearer ")) {
    const token = header.slice("Bearer ".length).trim();
    if (token) return token;
  }

  return undefined;
}
