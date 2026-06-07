import type { NextFunction, Request, Response } from "express";
import { PlatformRole } from "@productpath/database";
import { getUserFromSession } from "../services/auth.service";
import { getSessionTokenFromRequest } from "../lib/session-token";

export type AuthedRequest = Request & {
  user?: NonNullable<Awaited<ReturnType<typeof getUserFromSession>>>;
};

export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = getSessionTokenFromRequest(req);
  const user = await getUserFromSession(token);

  if (!user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  req.user = user;
  next();
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
  const token = getSessionTokenFromRequest(req);
  req.user = (await getUserFromSession(token)) ?? undefined;
  next();
}
