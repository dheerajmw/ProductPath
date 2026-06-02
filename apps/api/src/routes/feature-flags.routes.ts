import { Router } from "express";
import { prisma } from "@productpath/database";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const flags = await prisma.featureFlag.findMany({
      select: { key: true, enabled: true },
    });
    const map = Object.fromEntries(flags.map((f) => [f.key, f.enabled]));
    res.json({ flags: map });
  } catch (e) {
    next(e);
  }
});

export { router as featureFlagsRoutes };
