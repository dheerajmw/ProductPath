import type { Request } from "express";
import { SESSION_COOKIE } from "@productpath/shared";

export function getBearerTokenFromRequest(req: Request): string | undefined {
  const header = req.headers.authorization;
  if (typeof header !== "string") return undefined;

  const match = header.match(/^Bearer\s+(.+)$/i);
  const token = match?.[1]?.trim();
  return token || undefined;
}

export function getCookieTokenFromRequest(req: Request): string | undefined {
  const cookie = req.cookies?.[SESSION_COOKIE] as string | undefined;
  return cookie || undefined;
}

/**
 * Session tokens to verify, in priority order.
 * Bearer is tried before cookie so a fresh login token wins over a stale pp_session cookie.
 */
export function getSessionTokenCandidates(req: Request): string[] {
  const bearer = getBearerTokenFromRequest(req);
  const cookie = getCookieTokenFromRequest(req);
  const candidates: string[] = [];

  if (bearer) candidates.push(bearer);
  if (cookie && cookie !== bearer) candidates.push(cookie);

  return candidates;
}

/** Primary token for logout etc. — prefer Bearer (explicit client intent). */
export function getSessionTokenFromRequest(req: Request): string | undefined {
  return getBearerTokenFromRequest(req) ?? getCookieTokenFromRequest(req);
}

export type AuthFailureReason = "no_token" | "session_not_found" | "session_expired";

export function classifyAuthFailure(
  candidates: string[],
  lookup: "missing" | "expired" | "not_found",
): AuthFailureReason {
  if (candidates.length === 0) return "no_token";
  if (lookup === "expired") return "session_expired";
  return "session_not_found";
}
