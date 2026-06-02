import { Router } from "express";
import { saveAnswerSchema } from "@productpath/shared";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { requireCandidate } from "../middleware/candidate";
import {
  getAttemptForUser,
  saveAnswer,
  submitAttempt,
  getResultForAttempt,
} from "../services/assessment.service";

const router = Router();

router.use(requireAuth);
router.use(requireCandidate);

router.get("/:id", async (req: AuthedRequest, res, next) => {
  try {
    const attempt = await getAttemptForUser(req.user!.id, String(req.params.id));
    res.json(attempt);
  } catch (e) {
    next(e);
  }
});

router.put("/:id/answers", async (req: AuthedRequest, res, next) => {
  try {
    const body = saveAnswerSchema.parse(req.body);
    const attempt = await saveAnswer(
      req.user!.id,
      String(req.params.id),
      body.questionId,
      body.selectedIndex,
      body.currentQuestionIndex,
    );
    res.json(attempt);
  } catch (e) {
    next(e);
  }
});

router.post("/:id/submit", async (req: AuthedRequest, res, next) => {
  try {
    const result = await submitAttempt(req.user!.id, String(req.params.id));
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.get("/:id/result", async (req: AuthedRequest, res, next) => {
  try {
    const result = await getResultForAttempt(req.user!.id, String(req.params.id));
    res.json(result);
  } catch (e) {
    next(e);
  }
});

export { router as attemptsRoutes };
