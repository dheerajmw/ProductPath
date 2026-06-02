import { Router } from "express";
import { selectRoleSchema } from "@productpath/shared";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { requireCandidate } from "../middleware/candidate";
import {
  selectRole,
  getRoadmapForUser,
  getLearningProgress,
  LearningError,
} from "../services/learning.service";
import { getResultsHistory, getGaps } from "../services/assessment.service";
import {
  getRecommendations,
  refreshRecommendations,
  getSkillDevelopment,
} from "../services/recommendation.service";
import { listMySubmissions } from "../services/project.service";
import {
  evaluateVerification,
  getVerificationForUser,
} from "../services/verification.service.js";

const router = Router();

router.use(requireAuth);
router.use(requireCandidate);

router.post("/me/role", async (req: AuthedRequest, res, next) => {
  try {
    const { roleId, confirmArchive } = selectRoleSchema.parse(req.body);
    const result = await selectRole(req.user!.id, roleId, confirmArchive, req.ip);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.get("/me/roadmap", async (req: AuthedRequest, res, next) => {
  try {
    const roadmap = await getRoadmapForUser(req.user!.id);
    res.json(roadmap);
  } catch (e) {
    next(e);
  }
});

router.get("/me/progress", async (req: AuthedRequest, res, next) => {
  try {
    const progress = await getLearningProgress(req.user!.id);
    res.json({ progress });
  } catch (e) {
    next(e);
  }
});

router.get("/me/assessments/results", async (req: AuthedRequest, res, next) => {
  try {
    const data = await getResultsHistory(req.user!.id);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

router.get("/me/gaps", async (req: AuthedRequest, res, next) => {
  try {
    const data = await getGaps(req.user!.id);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

router.get("/me/recommendations", async (req: AuthedRequest, res, next) => {
  try {
    const data = await getRecommendations(req.user!.id);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

router.post("/me/recommendations/refresh", async (req: AuthedRequest, res, next) => {
  try {
    const data = await refreshRecommendations(req.user!.id);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

router.get("/me/verification", async (req: AuthedRequest, res, next) => {
  try {
    const data = await getVerificationForUser(req.user!.id);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

router.post("/me/verification/refresh", async (req: AuthedRequest, res, next) => {
  try {
    const data = await evaluateVerification(req.user!.id);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

router.get("/me/submissions", async (req: AuthedRequest, res, next) => {
  try {
    const data = await listMySubmissions(req.user!.id);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

router.get("/me/skill-development", async (req: AuthedRequest, res, next) => {
  try {
    const data = await getSkillDevelopment(req.user!.id);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

export { router as candidatesRoutes, LearningError };
