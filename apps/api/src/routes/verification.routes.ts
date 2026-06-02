import { Router } from "express";
import {
  evaluateVerification,
  getPublicCandidateProfile,
  processVerificationExpiry,
  VerificationError,
} from "../services/verification.service.js";

const router = Router();

router.get("/:id/public", async (req, res, next) => {
  try {
    const data = await getPublicCandidateProfile(String(req.params.id));
    res.json({ profile: data });
  } catch (e) {
    next(e);
  }
});

export { router as publicCandidateRoutes, VerificationError };

const internalRouter = Router();

internalRouter.post("/verification/evaluate", async (req, res, next) => {
  try {
    const secret = req.headers["x-internal-secret"];
    if (!process.env.INTERNAL_API_SECRET || secret !== process.env.INTERNAL_API_SECRET) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const userId = (req.body as { userId?: string }).userId;
    if (!userId) {
      return res.status(400).json({ error: "userId required" });
    }
    const data = await evaluateVerification(userId);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

internalRouter.post("/verification/expire", async (req, res, next) => {
  try {
    const secret = req.headers["x-internal-secret"];
    if (!process.env.INTERNAL_API_SECRET || secret !== process.env.INTERNAL_API_SECRET) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const result = await processVerificationExpiry();
    res.json(result);
  } catch (e) {
    next(e);
  }
});

export { internalRouter as internalRoutes };
