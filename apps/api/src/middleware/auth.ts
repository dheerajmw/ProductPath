import type { NextFunction, Request, Response } from "express";
import { PlatformRole } from "@productpath/database";
import { SESSION_COOKIE } from "@productpath/shared";
import { getUserFromSession } from "../services/auth.service";

export type AuthedRequest = Request & {
  user?: NonNullable<Awaited<ReturnType<typeof getUserFromSession>>>;
};

export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.[SESSION_COOKIE] as string | undefined;
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
  const token = req.cookies?.[SESSION_COOKIE] as string | undefined;
  req.user = (await getUserFromSession(token)) ?? undefined;
  next();
}
