import { Router } from "express";
import { prisma } from "@productpath/database";

const router = Router();
const startedAt = new Date();

router.get("/health", async (_req, res) => {
  let dbOk = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch {
    dbOk = false;
  }

  const status = dbOk ? "ok" : "degraded";
  res.status(dbOk ? 200 : 503).json({
    status,
    service: "productpath-api",
    uptimeSeconds: Math.floor((Date.now() - startedAt.getTime()) / 1000),
    timestamp: new Date().toISOString(),
    checks: { database: dbOk ? "up" : "down" },
  });
});

router.get("/metrics", (_req, res) => {
  res.json({
    memory: process.memoryUsage(),
    uptimeSeconds: process.uptime(),
  });
});

export { router as healthRoutes };
