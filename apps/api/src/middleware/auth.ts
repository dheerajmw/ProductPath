import type { NextFunction, Request, Response } from "express";
import { PlatformRole } from "@productpath/database";
import { SESSION_COOKIE } from "@productpath/shared";
import { getUserFromSession, type SessionLookupResult } from "../services/auth.service";
import {
  classifyAuthFailure,
  getSessionTokenCandidates,
  getSessionTokenFromRequest,
} from "../lib/session-token";
import { logger } from "../lib/logger";

export type AuthedRequest = Request & {
  user?: NonNullable<Extract<SessionLookupResult, { user: unknown }>["user"]>;
};

function isAuthDebugEnabled(): boolean {
  return process.env.AUTH_DEBUG === "1";
}

async function resolveAuthenticatedUser(req: Request): Promise<
  | { user: Extract<SessionLookupResult, { status: "ok" }>["user"]; token: string }
  | { failure: Exclude<SessionLookupResult["status"], "ok">; candidates: string[] }
> {
  const candidates = getSessionTokenCandidates(req);

  if (candidates.length === 0) {
    return { failure: "missing", candidates };
  }

  let lastFailure: SessionLookupResult["status"] = "not_found";

  for (const token of candidates) {
    const result = await getUserFromSession(token);
    if (result.status === "ok") {
      return { user: result.user, token };
    }
    lastFailure = result.status;
  }

  return { failure: lastFailure, candidates };
}

function logAuthAttempt(req: Request, candidates: string[], event: string, extra?: Record<string, unknown>) {
  if (!isAuthDebugEnabled()) return;

  logger.info(
    {
      event,
      path: req.path,
      method: req.method,
      authHeader: typeof req.headers.authorization === "string" ? "present" : "missing",
      cookiePresent: Boolean(req.cookies?.[SESSION_COOKIE]),
      candidateCount: candidates.length,
      tokenPrefixes: candidates.map((t) => t.slice(0, 8)),
      ...extra,
    },
    "auth:debug",
  );
}

export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const candidates = getSessionTokenCandidates(req);
  logAuthAttempt(req, candidates, "requireAuth:start");

  const resolved = await resolveAuthenticatedUser(req);

  if ("user" in resolved) {
    req.user = resolved.user;
    logAuthAttempt(req, candidates, "requireAuth:ok", { userId: resolved.user.id });
    return next();
  }

  const reason = classifyAuthFailure(
    resolved.candidates,
    resolved.failure === "missing" ? "not_found" : resolved.failure,
  );

  logAuthAttempt(req, candidates, "requireAuth:failed", { reason });

  return res.status(401).json({
    error: "Authentication required",
    ...(isAuthDebugEnabled() ? { reason } : {}),
  });
}

export function requireRoles(...roles: PlatformRole[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    if (!roles.includes(req.user.platformRole)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}

export async function optionalAuth(req: AuthedRequest, _res: Response, next: NextFunction) {
  const resolved = await resolveAuthenticatedUser(req);
  if ("user" in resolved) {
    req.user = resolved.user;
  }
  next();
}

export { getSessionTokenFromRequest };
