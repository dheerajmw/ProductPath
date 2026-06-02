import { Router } from "express";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { requireCandidate } from "../middleware/candidate";
import { getAssessmentHub, startAttempt } from "../services/assessment.service";

const router = Router();

router.use(requireAuth);
router.use(requireCandidate);

router.get("/hub", async (req: AuthedRequest, res, next) => {
  try {
    const hub = await getAssessmentHub(req.user!.id);
    res.json(hub);
  } catch (e) {
    next(e);
  }
});

router.post("/:id/attempts", async (req: AuthedRequest, res, next) => {
  try {
    const attempt = await startAttempt(req.user!.id, String(req.params.id));
    res.status(201).json(attempt);
  } catch (e) {
    next(e);
  }
});

export { router as assessmentsRoutes };
