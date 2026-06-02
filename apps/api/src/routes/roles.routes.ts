import { Router } from "express";
import { prisma } from "@productpath/database";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, slug: true, name: true, description: true },
    });
    res.json({ roles });
  } catch (e) {
    next(e);
  }
});

export { router as rolesRoutes };
