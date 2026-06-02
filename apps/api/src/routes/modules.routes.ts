import { Router } from "express";
import { toggleResourceSchema } from "@productpath/shared";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { requireCandidate } from "../middleware/candidate";
import {
  getModuleForUser,
  toggleResourceProgress,
  completeModule,
  LearningError,
} from "../services/learning.service";

const router = Router();

router.use(requireAuth);
router.use(requireCandidate);

router.get("/:id", async (req: AuthedRequest, res, next) => {
  try {
    const module = await getModuleForUser(req.user!.id, String(req.params.id));
    res.json(module);
  } catch (e) {
    next(e);
  }
});

router.post("/:id/resources/:resourceId/toggle", async (req: AuthedRequest, res, next) => {
  try {
    const { completed } = toggleResourceSchema.parse(req.body);
    const module = await toggleResourceProgress(
      req.user!.id,
      String(req.params.resourceId),
      completed,
    );
    res.json(module);
  } catch (e) {
    next(e);
  }
});

router.post("/:id/complete", async (req: AuthedRequest, res, next) => {
  try {
    const module = await completeModule(req.user!.id, String(req.params.id));
    res.json(module);
  } catch (e) {
    next(e);
  }
});

export { router as modulesRoutes, LearningError };
