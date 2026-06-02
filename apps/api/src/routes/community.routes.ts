import { Router } from "express";
import {
  createCommentSchema,
  createPostSchema,
  createReportSchema,
  feedQuerySchema,
  RATE_LIMITS,
} from "@productpath/shared";
import { createRateLimiter } from "../lib/rate-limit.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import {
  addComment,
  createPost,
  createReport,
  getFeed,
  getPost,
  toggleLike,
} from "../services/community.service.js";

const router = Router();

const postLimiter = createRateLimiter({
  ...RATE_LIMITS.post,
  message: { error: "Too many posts. Try again later." },
});

const likeLimiter = createRateLimiter({
  ...RATE_LIMITS.like,
  message: { error: "Too many likes. Slow down." },
});

router.use(requireAuth);

router.get("/feed", async (req: AuthedRequest, res, next) => {
  try {
    const query = feedQuerySchema.parse(req.query);
    const data = await getFeed(req.user!.id, query.cursor, query.limit);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

router.post("/posts", postLimiter, async (req: AuthedRequest, res, next) => {
  try {
    const body = createPostSchema.parse(req.body);
    const data = await createPost(req.user!.id, body);
    res.status(201).json(data);
  } catch (e) {
    next(e);
  }
});

router.get("/posts/:id", async (req: AuthedRequest, res, next) => {
  try {
    const data = await getPost(String(req.params.id), req.user!.id);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

router.post("/posts/:id/comments", async (req: AuthedRequest, res, next) => {
  try {
    const body = createCommentSchema.parse(req.body);
    const data = await addComment(req.user!.id, String(req.params.id), body);
    res.status(201).json(data);
  } catch (e) {
    next(e);
  }
});

router.post("/posts/:id/like", likeLimiter, async (req: AuthedRequest, res, next) => {
  try {
    const data = await toggleLike(req.user!.id, String(req.params.id));
    res.json(data);
  } catch (e) {
    next(e);
  }
});

router.post("/reports", async (req: AuthedRequest, res, next) => {
  try {
    const body = createReportSchema.parse(req.body);
    const data = await createReport(req.user!.id, body);
    res.status(201).json(data);
  } catch (e) {
    next(e);
  }
});

export { router as communityRoutes };
