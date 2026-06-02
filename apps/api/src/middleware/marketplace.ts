import type { NextFunction, Response } from "express";
import { assertInterviewReady } from "../services/verification.service.js";
import type { AuthedRequest } from "./auth";

/** D-08: Marketplace discovery requires interview_ready (or verified_professional). */
export async function requireInterviewReady(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    await assertInterviewReady(req.user.id);
    next();
  } catch (e) {
    next(e);
  }
}
