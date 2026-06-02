import type { NextFunction, Response } from "express";
import { PlatformRole } from "@productpath/database";
import type { AuthedRequest } from "./auth";

export function requireCandidate(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  if (
    req.user.platformRole !== PlatformRole.CANDIDATE &&
    req.user.platformRole !== PlatformRole.ADMIN
  ) {
    return res.status(403).json({ error: "Candidate access required" });
  }
  if (!req.user.candidateProfile) {
    return res.status(403).json({ error: "Candidate profile required" });
  }
  next();
}
