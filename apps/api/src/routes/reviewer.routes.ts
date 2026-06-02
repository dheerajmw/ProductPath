import { Router } from "express";
import { PlatformRole } from "@productpath/database";
import { reviewBodySchema } from "@productpath/shared";
import { z } from "zod";
import { requireAuth, requireRoles, type AuthedRequest } from "../middleware/auth";
import {
  getReviewerQueue,
  getSubmissionForReview,
  submitReview,
  reverseApproval,
  ReviewError,
} from "../services/review.service";

const router = Router();

router.use(requireAuth);
router.use(requireRoles(PlatformRole.ADMIN, PlatformRole.REVIEWER));

router.get("/reviewer/queue", async (_req, res, next) => {
  try {
    const data = await getReviewerQueue();
    res.json(data);
  } catch (e) {
    next(e);
  }
});

router.get("/reviewer/submissions/:id", async (req, res, next) => {
  try {
    const data = await getSubmissionForReview(String(req.params.id));
    res.json(data);
  } catch (e) {
    next(e);
  }
});

router.post("/reviews", async (req: AuthedRequest, res, next) => {
  try {
    const body = reviewBodySchema.parse(req.body);
    const data = await submitReview(req.user!.id, body);
    res.status(201).json(data);
  } catch (e) {
    next(e);
  }
});

router.post("/reviews/:submissionId/reverse", requireRoles(PlatformRole.ADMIN), async (req: AuthedRequest, res, next) => {
  try {
    const { reason } = z.object({ reason: z.string().min(20) }).parse(req.body);
    const data = await reverseApproval(req.user!.id, String(req.params.submissionId), reason);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

export { router as reviewerRoutes, ReviewError };
