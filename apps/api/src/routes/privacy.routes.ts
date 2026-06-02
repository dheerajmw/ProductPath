import { Router } from "express";
import { prisma } from "@productpath/database";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { writeAudit } from "../lib/audit";

const router = Router();

/** Stub: GDPR data export (X-09) */
router.get("/export", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        candidateProfile: { include: { activeRole: true } },
        recruiterProfile: true,
        auditLogs: { take: 100, orderBy: { createdAt: "desc" } },
      },
    });

    await writeAudit({
      userId,
      action: "privacy.export_requested",
      ipAddress: req.ip,
    });

    res.json({
      exportedAt: new Date().toISOString(),
      data: user,
      note: "MVP export stub. Production will add async job and download link.",
    });
  } catch (e) {
    next(e);
  }
});

/** Stub: account deletion request (X-09) */
router.post("/delete-request", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const userId = req.user!.id;

    await writeAudit({
      userId,
      action: "privacy.delete_requested",
      ipAddress: req.ip,
    });

    res.json({
      message:
        "Deletion request recorded. MVP queues manual review; production will schedule anonymization.",
      status: "pending",
    });
  } catch (e) {
    next(e);
  }
});

export { router as privacyRoutes };
