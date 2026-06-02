import { Router } from "express";
import { prisma, PlatformRole } from "@productpath/database";
import { z } from "zod";
import {
  roadmapBodySchema,
  moduleBodySchema,
  resourceBodySchema,
  questionBodySchema,
  skillMappingsBodySchema,
  projectTemplateBodySchema,
} from "@productpath/shared";
import { listSkillMappings, upsertSkillMappings } from "../services/recommendation.service";
import { requireAuth, requireRoles, type AuthedRequest } from "../middleware/auth";

const router = Router();

router.use(requireAuth);
router.use(requireRoles(PlatformRole.ADMIN));

router.get("/roadmaps", async (_req, res, next) => {
  try {
    const roadmaps = await prisma.roadmap.findMany({
      include: {
        role: { select: { slug: true, name: true } },
        _count: { select: { modules: true } },
      },
      orderBy: [{ roleId: "asc" }, { version: "desc" }],
    });
    res.json({ roadmaps });
  } catch (e) {
    next(e);
  }
});

router.post("/roadmaps", async (req: AuthedRequest, res, next) => {
  try {
    const body = roadmapBodySchema.parse(req.body);
    const existing = await prisma.roadmap.findFirst({
      where: { roleId: body.roleId },
      orderBy: { version: "desc" },
    });
    const version = existing ? existing.version + 1 : 1;
    const roadmap = await prisma.roadmap.create({
      data: {
        roleId: body.roleId,
        version,
        title: body.title,
        description: body.description,
        published: body.published ?? false,
      },
    });
    res.status(201).json({ roadmap });
  } catch (e) {
    next(e);
  }
});

router.get("/roadmaps/:id", async (req, res, next) => {
  try {
    const roadmap = await prisma.roadmap.findUnique({
      where: { id: String(req.params.id) },
      include: {
        role: true,
        modules: {
          orderBy: { sortOrder: "asc" },
          include: { resources: true, prerequisites: true },
        },
      },
    });
    if (!roadmap) return res.status(404).json({ error: "Roadmap not found" });
    res.json({ roadmap });
  } catch (e) {
    next(e);
  }
});

router.post("/modules", async (req, res, next) => {
  try {
    const body = moduleBodySchema.parse(req.body);
    const mod = await prisma.module.create({
      data: {
        roadmapId: body.roadmapId,
        slug: body.slug,
        title: body.title,
        description: body.description,
        sortOrder: body.sortOrder ?? 0,
      },
    });
    if (body.prerequisiteIds?.length) {
      await prisma.modulePrerequisite.createMany({
        data: body.prerequisiteIds.map((prerequisiteId) => ({
          moduleId: mod.id,
          prerequisiteId,
        })),
        skipDuplicates: true,
      });
    }
    res.status(201).json({ module: mod });
  } catch (e) {
    next(e);
  }
});

router.patch("/modules/:id", async (req, res, next) => {
  try {
    const { title, description, sortOrder } = req.body as {
      title?: string;
      description?: string;
      sortOrder?: number;
    };
    const mod = await prisma.module.update({
      where: { id: String(req.params.id) },
      data: { title, description, sortOrder },
    });
    res.json({ module: mod });
  } catch (e) {
    next(e);
  }
});

router.post("/resources", async (req, res, next) => {
  try {
    const body = resourceBodySchema.parse(req.body);
    const resource = await prisma.resource.create({
      data: {
        moduleId: body.moduleId,
        title: body.title,
        type: body.type,
        url: body.url ?? null,
        content: body.content ?? null,
        required: body.required ?? true,
        sortOrder: body.sortOrder ?? 0,
      },
    });
    res.status(201).json({ resource });
  } catch (e) {
    next(e);
  }
});

router.patch("/resources/:id", async (req, res, next) => {
  try {
    const body = resourceBodySchema.partial().extend({ moduleId: z.string().optional() }).parse(req.body);
    const resource = await prisma.resource.update({
      where: { id: String(req.params.id) },
      data: body,
    });
    res.json({ resource });
  } catch (e) {
    next(e);
  }
});

router.get("/assessments", async (_req, res, next) => {
  try {
    const assessments = await prisma.assessment.findMany({
      include: {
        role: { select: { name: true, slug: true } },
        _count: { select: { questions: true } },
      },
      orderBy: [{ roleId: "asc" }, { version: "desc" }],
    });
    res.json({ assessments });
  } catch (e) {
    next(e);
  }
});

router.get("/skills", async (_req, res, next) => {
  try {
    const skills = await prisma.skill.findMany({ orderBy: { name: "asc" } });
    res.json({ skills });
  } catch (e) {
    next(e);
  }
});

router.get("/questions", async (req, res, next) => {
  try {
    const assessmentId = req.query.assessmentId as string | undefined;
    const questions = await prisma.question.findMany({
      where: assessmentId ? { assessmentId } : undefined,
      include: { skill: { select: { name: true, slug: true } } },
      orderBy: { sortOrder: "asc" },
    });
    res.json({ questions });
  } catch (e) {
    next(e);
  }
});

router.post("/questions", async (req, res, next) => {
  try {
    const body = questionBodySchema.parse(req.body);
    if (body.correctIndex >= body.options.length) {
      return res.status(400).json({ error: "correctIndex out of range" });
    }
    const question = await prisma.question.create({
      data: {
        assessmentId: body.assessmentId,
        skillId: body.skillId,
        prompt: body.prompt,
        options: body.options,
        correctIndex: body.correctIndex,
        sortOrder: body.sortOrder ?? 0,
      },
    });
    res.status(201).json({ question });
  } catch (e) {
    next(e);
  }
});

router.get("/skill-mappings", async (req, res, next) => {
  try {
    const skillId = req.query.skillId as string | undefined;
    const data = await listSkillMappings(skillId);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

router.put("/skill-mappings", async (req, res, next) => {
  try {
    const body = skillMappingsBodySchema.parse(req.body);
    const data = await upsertSkillMappings(body.mappings);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

router.get("/project-templates", async (_req, res, next) => {
  try {
    const templates = await prisma.projectTemplate.findMany({
      include: { role: { select: { name: true, slug: true } } },
      orderBy: [{ roleId: "asc" }, { sortOrder: "asc" }],
    });
    res.json({ templates });
  } catch (e) {
    next(e);
  }
});

router.post("/project-templates", async (req, res, next) => {
  try {
    const body = projectTemplateBodySchema.parse(req.body);
    const template = await prisma.projectTemplate.create({ data: body });
    res.status(201).json({ template });
  } catch (e) {
    next(e);
  }
});

router.patch("/questions/:id", async (req, res, next) => {
  try {
    const body = questionBodySchema.partial().parse(req.body);
    const question = await prisma.question.update({
      where: { id: String(req.params.id) },
      data: {
        ...body,
        options: body.options ?? undefined,
      },
    });
    res.json({ question });
  } catch (e) {
    next(e);
  }
});

export { router as adminContentRoutes };
