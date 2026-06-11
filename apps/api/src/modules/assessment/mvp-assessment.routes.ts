import { Router } from "express";
import { startMvpAssessmentSchema, submitMvpResponseSchema } from "@productpath/shared";
import { requireAuth, type AuthedRequest } from "../../middleware/auth.js";
import { requireCandidate } from "../../middleware/candidate.js";
import {
  completeMvpSession,
  getMvpHistory,
  getMvpResult,
  getMvpSession,
  listMvpRoles,
  startMvpSession,
  submitMvpResponse,
} from "./mvp-assessment.service.js";

export const mvpAssessmentRoutes = Router();

mvpAssessmentRoutes.use(requireAuth, requireCandidate);

mvpAssessmentRoutes.get("/roles", (_req, res) => {
  res.json({ roles: listMvpRoles() });
});

mvpAssessmentRoutes.post("/start", async (req: AuthedRequest, res, next) => {
  try {
    const body = startMvpAssessmentSchema.parse(req.body);
    const data = await startMvpSession(req.user!.id, body.roleSlug, body.difficulty);
    res.status(201).json(data);
  } catch (e) {
    next(e);
  }
});

mvpAssessmentRoutes.get("/sessions/:sessionId", async (req: AuthedRequest, res, next) => {
  try {
    const data = await getMvpSession(req.user!.id, String(req.params.sessionId));
    res.json(data);
  } catch (e) {
    next(e);
  }
});

mvpAssessmentRoutes.put("/sessions/:sessionId/response", async (req: AuthedRequest, res, next) => {
  try {
    const body = submitMvpResponseSchema.parse(req.body);
    const data = await submitMvpResponse(req.user!.id, String(req.params.sessionId), body);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

mvpAssessmentRoutes.post("/sessions/:sessionId/submit", async (req: AuthedRequest, res, next) => {
  try {
    const data = await completeMvpSession(req.user!.id, String(req.params.sessionId));
    res.json(data);
  } catch (e) {
    next(e);
  }
});

mvpAssessmentRoutes.get("/sessions/:sessionId/result", async (req: AuthedRequest, res, next) => {
  try {
    const data = await getMvpResult(req.user!.id, String(req.params.sessionId));
    res.json(data);
  } catch (e) {
    next(e);
  }
});

mvpAssessmentRoutes.get("/history", async (req: AuthedRequest, res, next) => {
  try {
    const roleSlug = typeof req.query.roleSlug === "string" ? req.query.roleSlug : undefined;
    const data = await getMvpHistory(req.user!.id, roleSlug as never);
    res.json(data);
  } catch (e) {
    next(e);
  }
});
