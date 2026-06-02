import { Router } from "express";
import { prisma, PlatformRole } from "@productpath/database";
import { requireAuth, requireRoles, type AuthedRequest } from "../middleware/auth";
import { listRecruitersPending, verifyRecruiter } from "../services/recruiter.service.js";
import { listReports, resolveReport } from "../services/moderation.service.js";
import { moderationActionSchema } from "@productpath/shared";
import { ReportStatus } from "@prisma/client";

const router = Router();

router.use(requireAuth);
router.use(requireRoles(PlatformRole.ADMIN));

router.get("/dashboard", async (_req, res, next) => {
  try {
    const [users, candidates, recruiters, roles, auditCount] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { platformRole: PlatformRole.CANDIDATE } }),
      prisma.user.count({ where: { platformRole: PlatformRole.RECRUITER } }),
      prisma.role.count(),
      prisma.auditLog.count(),
    ]);

    res.json({
      stats: { users, candidates, recruiters, roles, auditCount },
      environment: process.env.NODE_ENV ?? "development",
    });
  } catch (e) {
    next(e);
  }
});

router.get("/audit-logs", async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const logs = await prisma.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { email: true, platformRole: true } } },
    });
    res.json({ logs });
  } catch (e) {
    next(e);
  }
});

router.get("/feature-flags", async (_req, res, next) => {
  try {
    const flags = await prisma.featureFlag.findMany();
    res.json({ flags });
  } catch (e) {
    next(e);
  }
});

router.patch("/feature-flags/:key", async (req: AuthedRequest, res, next) => {
  try {
    const { enabled } = req.body as { enabled?: boolean };
    if (typeof enabled !== "boolean") {
      return res.status(400).json({ error: "enabled must be a boolean" });
    }

    const flag = await prisma.featureFlag.update({
      where: { key: String(req.params.key) },
      data: { enabled },
    });

    res.json({ flag });
  } catch (e) {
    next(e);
  }
});

router.get("/recruiters/pending", async (_req, res, next) => {
  try {
    const data = await listRecruitersPending();
    res.json(data);
  } catch (e) {
    next(e);
  }
});

router.post("/recruiters/:userId/verify", async (req: AuthedRequest, res, next) => {
  try {
    const data = await verifyRecruiter(String(req.params.userId), req.user!.id);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

router.get("/moderation/reports", async (req, res, next) => {
  try {
    const status =
      req.query.status === "RESOLVED" || req.query.status === "DISMISSED"
        ? (req.query.status as ReportStatus)
        : ReportStatus.PENDING;
    const data = await listReports(status);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

router.patch("/moderation/reports/:id", async (req: AuthedRequest, res, next) => {
  try {
    const { action, note } = moderationActionSchema.parse(req.body);
    const data = await resolveReport(req.user!.id, String(req.params.id), action, note);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

router.get("/config", async (_req, res, next) => {
  try {
    const config = await prisma.appConfig.findUnique({
      where: { key: "verification_policy" },
    });
    res.json({ config });
  } catch (e) {
    next(e);
  }
});

export { router as adminRoutes };
