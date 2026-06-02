import { Router } from "express";
import {
  discoverySettingsSchema,
  interestActionSchema,
  interestRequestSchema,
  recruiterSignupSchema,
  talentSearchSchema,
} from "@productpath/shared";
import { RATE_LIMITS } from "@productpath/shared";
import { createRateLimiter } from "../lib/rate-limit.js";
import { PlatformRole } from "@productpath/database";
import { requireAuth, requireRoles, type AuthedRequest } from "../middleware/auth";
import {
  getDiscoverySettings,
  getCandidateForRecruiter,
  searchTalent,
  updateDiscoverySettings,
} from "../services/marketplace.service.js";
import {
  getRecruiterMe,
  recruiterSignup,
} from "../services/recruiter.service.js";
import {
  listCandidateInterests,
  listRecruiterInterests,
  respondToInterest,
  sendInterest,
} from "../services/interest.service.js";

const router = Router();

const interestLimiter = createRateLimiter({
  ...RATE_LIMITS.interest,
  message: { error: "Too many interest requests. Try again later." },
});

router.post("/signup", async (req, res, next) => {
  try {
    const body = recruiterSignupSchema.parse(req.body);
    const result = await recruiterSignup(body, req.ip);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});

router.use(requireAuth);

router.get("/me", requireRoles(PlatformRole.RECRUITER), async (req: AuthedRequest, res, next) => {
  try {
    const data = await getRecruiterMe(req.user!.id);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

router.get("/talent", requireRoles(PlatformRole.RECRUITER), async (req: AuthedRequest, res, next) => {
  try {
    const filters = talentSearchSchema.parse(req.query);
    const data = await searchTalent(req.user!.id, filters);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

router.get(
  "/candidates/:id",
  requireRoles(PlatformRole.RECRUITER),
  async (req: AuthedRequest, res, next) => {
    try {
      const data = await getCandidateForRecruiter(req.user!.id, String(req.params.id));
      res.json(data);
    } catch (e) {
      next(e);
    }
  },
);

router.get(
  "/me/interests",
  requireRoles(PlatformRole.RECRUITER),
  async (req: AuthedRequest, res, next) => {
    try {
      const data = await listRecruiterInterests(req.user!.id);
      res.json(data);
    } catch (e) {
      next(e);
    }
  },
);

export { router as recruitersRoutes };

const candidateMarketplaceRouter = Router();
candidateMarketplaceRouter.use(requireAuth);
candidateMarketplaceRouter.use(requireRoles(PlatformRole.CANDIDATE));

candidateMarketplaceRouter.get("/me/discovery", async (req: AuthedRequest, res, next) => {
  try {
    const data = await getDiscoverySettings(req.user!.id);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

candidateMarketplaceRouter.patch("/me/discovery", async (req: AuthedRequest, res, next) => {
  try {
    const { discoverable } = discoverySettingsSchema.parse(req.body);
    const data = await updateDiscoverySettings(req.user!.id, discoverable);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

candidateMarketplaceRouter.get("/me/interests", async (req: AuthedRequest, res, next) => {
  try {
    const data = await listCandidateInterests(req.user!.id);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

export { candidateMarketplaceRouter };

const interestRouter = Router();
interestRouter.use(requireAuth);

interestRouter.post(
  "/",
  requireRoles(PlatformRole.RECRUITER),
  interestLimiter,
  async (req: AuthedRequest, res, next) => {
    try {
      const body = interestRequestSchema.parse(req.body);
      const interest = await sendInterest(req.user!.id, body.candidateId, body.message);
      res.status(201).json({ interest });
    } catch (e) {
      next(e);
    }
  },
);

interestRouter.patch("/:id", requireRoles(PlatformRole.CANDIDATE), async (req: AuthedRequest, res, next) => {
  try {
    const { action } = interestActionSchema.parse(req.body);
    const data = await respondToInterest(req.user!.id, String(req.params.id), action);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

export { interestRouter as interestRoutes };
