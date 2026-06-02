import { prisma } from "@productpath/database";
import { ModuleProgressStatus, SkillDevelopmentStatus } from "@prisma/client";
import { writeAudit } from "../lib/audit";

export class RecommendationError extends Error {
  constructor(
    message: string,
    public statusCode = 400,
    public code?: string,
  ) {
    super(message);
    this.name = "RecommendationError";
  }
}

type PolicyConfig = {
  verification: { skill_floor_threshold: number };
};

async function getPolicy(): Promise<PolicyConfig> {
  const row = await prisma.appConfig.findUnique({ where: { key: "verification_policy" } });
  const defaults: PolicyConfig = { verification: { skill_floor_threshold: 50 } };
  if (!row?.value) return defaults;
  return { ...defaults, ...(row.value as object) } as PolicyConfig;
}

async function getActiveRoleId(userId: string) {
  const profile = await prisma.candidateProfile.findUnique({ where: { userId } });
  if (!profile?.activeRoleId) {
    throw new RecommendationError("Select a product role first", 400, "NO_ACTIVE_ROLE");
  }
  return profile.activeRoleId;
}

async function getRoleRoadmapModuleIds(roleId: string) {
  const roadmap = await prisma.roadmap.findFirst({
    where: { roleId, published: true },
    orderBy: { version: "desc" },
    include: { modules: { select: { id: true } } },
  });
  if (!roadmap) return new Set<string>();
  return new Set(roadmap.modules.map((m) => m.id));
}

async function resolveModulesForSkill(skillId: string, roleModuleIds: Set<string>) {
  const mappings = await prisma.skillModuleMapping.findMany({
    where: { skillId },
    orderBy: { priority: "asc" },
    include: {
      module: {
        select: { id: true, slug: true, title: true, description: true, roadmapId: true },
      },
    },
  });

  return mappings
    .filter((m) => roleModuleIds.has(m.moduleId))
    .map((m) => ({
      id: m.module.id,
      slug: m.module.slug,
      title: m.module.title,
      description: m.module.description,
    }));
}

async function getModuleCompletionMap(userId: string, roleId: string, moduleIds: string[]) {
  if (moduleIds.length === 0) return new Map<string, ModuleProgressStatus>();

  const progress = await prisma.userModuleProgress.findMany({
    where: { userId, roleId, moduleId: { in: moduleIds } },
  });
  return new Map(progress.map((p) => [p.moduleId, p.status]));
}

function computeSnapshotStatus(
  recommendedTotal: number,
  recommendedCompleted: number,
): SkillDevelopmentStatus {
  if (recommendedTotal === 0) return SkillDevelopmentStatus.GAP_OPEN;
  if (recommendedCompleted === 0) return SkillDevelopmentStatus.GAP_OPEN;
  if (recommendedCompleted >= recommendedTotal) return SkillDevelopmentStatus.MODULES_COMPLETED;
  return SkillDevelopmentStatus.IN_PROGRESS;
}

export async function generateRecommendationsFromAttempt(userId: string, attemptId: string) {
  const roleId = await getActiveRoleId(userId);
  const result = await prisma.assessmentResult.findUnique({
    where: { attemptId },
  });
  if (!result || result.userId !== userId || result.roleId !== roleId) {
    throw new RecommendationError("Assessment result not found", 404);
  }

  const policy = await getPolicy();
  const floor = policy.verification.skill_floor_threshold;
  const scores = result.scoresBySkill as {
    skillId: string;
    skillName: string;
    skillSlug: string;
    score: number;
  }[];

  const gaps = scores.filter((s) => s.score < floor);
  const roleModuleIds = await getRoleRoadmapModuleIds(roleId);

  for (const gap of gaps) {
    const modules = await resolveModulesForSkill(gap.skillId, roleModuleIds);
    const moduleIds = modules.map((m) => m.id);

    await prisma.learningRecommendation.upsert({
      where: {
        userId_roleId_skillId_sourceAttemptId: {
          userId,
          roleId,
          skillId: gap.skillId,
          sourceAttemptId: attemptId,
        },
      },
      update: { moduleIds },
      create: {
        userId,
        roleId,
        skillId: gap.skillId,
        sourceAttemptId: attemptId,
        moduleIds,
      },
    });

    const completion = await getModuleCompletionMap(userId, roleId, moduleIds);
    const recommendedCompleted = moduleIds.filter(
      (id) => completion.get(id) === ModuleProgressStatus.COMPLETED,
    ).length;
    const recommendedTotal = moduleIds.length;

    await prisma.skillDevelopmentSnapshot.upsert({
      where: { userId_roleId_skillId: { userId, roleId, skillId: gap.skillId } },
      update: {
        status: computeSnapshotStatus(recommendedTotal, recommendedCompleted),
        recommendedCompleted,
        recommendedTotal,
        sourceAttemptId: attemptId,
      },
      create: {
        userId,
        roleId,
        skillId: gap.skillId,
        sourceAttemptId: attemptId,
        status: computeSnapshotStatus(recommendedTotal, recommendedCompleted),
        recommendedCompleted,
        recommendedTotal,
      },
    });
  }

  const gapSkillIds = new Set(gaps.map((g) => g.skillId));
  await prisma.skillDevelopmentSnapshot.deleteMany({
    where: {
      userId,
      roleId,
      skillId: { notIn: [...gapSkillIds] },
    },
  });
  await prisma.learningRecommendation.deleteMany({
    where: {
      userId,
      roleId,
      sourceAttemptId: attemptId,
      skillId: { notIn: [...gapSkillIds] },
    },
  });

  await writeAudit({
    userId,
    action: "recommendations.generated",
    entity: "AssessmentAttempt",
    entityId: attemptId,
    metadata: { gapCount: gaps.length },
  });
}

export async function refreshRecommendations(userId: string) {
  const roleId = await getActiveRoleId(userId);
  const latest = await prisma.assessmentResult.findFirst({
    where: { userId, roleId },
    orderBy: { createdAt: "desc" },
  });
  if (!latest) {
    throw new RecommendationError("Complete an assessment first", 404, "NO_RESULTS");
  }
  await generateRecommendationsFromAttempt(userId, latest.attemptId);
  return getRecommendations(userId);
}

type RecommendedModule = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  status: ModuleProgressStatus | "NOT_STARTED";
  completed: boolean;
};

async function syncSnapshotProgress(userId: string, roleId: string, sourceAttemptId: string) {
  const recs = await prisma.learningRecommendation.findMany({
    where: { userId, roleId, sourceAttemptId },
  });
  for (const rec of recs) {
    const moduleIds = (rec.moduleIds as string[]) ?? [];
    const completion = await getModuleCompletionMap(userId, roleId, moduleIds);
    const recommendedCompleted = moduleIds.filter(
      (id) => completion.get(id) === ModuleProgressStatus.COMPLETED,
    ).length;
    const recommendedTotal = moduleIds.length;
    await prisma.skillDevelopmentSnapshot.updateMany({
      where: { userId, roleId, skillId: rec.skillId },
      data: {
        status: computeSnapshotStatus(recommendedTotal, recommendedCompleted),
        recommendedCompleted,
        recommendedTotal,
      },
    });
  }
}

export async function getRecommendations(userId: string) {
  const roleId = await getActiveRoleId(userId);
  const latest = await prisma.assessmentResult.findFirst({
    where: { userId, roleId },
    orderBy: { createdAt: "desc" },
  });
  if (!latest) {
    throw new RecommendationError("Complete an assessment first", 404, "NO_RESULTS");
  }

  await syncSnapshotProgress(userId, roleId, latest.attemptId);

  const policy = await getPolicy();
  const floor = policy.verification.skill_floor_threshold;
  const scores = latest.scoresBySkill as {
    skillId: string;
    skillName: string;
    skillSlug: string;
    score: number;
  }[];
  const gaps = scores
    .filter((s) => s.score < floor)
    .map((s) => ({
      skillId: s.skillId,
      skillName: s.skillName,
      skillSlug: s.skillSlug,
      score: s.score,
      floor,
      gap: floor - s.score,
    }));

  const recs = await prisma.learningRecommendation.findMany({
    where: { userId, roleId, sourceAttemptId: latest.attemptId },
    include: { skill: { select: { id: true, name: true, slug: true } } },
    orderBy: { createdAt: "asc" },
  });

  const allModuleIds = recs.flatMap((r) => (r.moduleIds as string[]) ?? []);
  const completion = await getModuleCompletionMap(userId, roleId, allModuleIds);

  const modulesById = new Map<string, { slug: string; title: string; description: string | null }>();
  if (allModuleIds.length > 0) {
    const mods = await prisma.module.findMany({
      where: { id: { in: allModuleIds } },
      select: { id: true, slug: true, title: true, description: true },
    });
    for (const m of mods) modulesById.set(m.id, m);
  }

  const items = recs.map((rec) => {
    const moduleIds = (rec.moduleIds as string[]) ?? [];
    const modules: RecommendedModule[] = moduleIds
      .map((id) => {
        const meta = modulesById.get(id);
        if (!meta) return null;
        const status = completion.get(id) ?? "NOT_STARTED";
        return {
          id,
          slug: meta.slug,
          title: meta.title,
          description: meta.description,
          status: status as ModuleProgressStatus | "NOT_STARTED",
          completed: status === ModuleProgressStatus.COMPLETED,
        };
      })
      .filter((m): m is RecommendedModule => m !== null);

    const gap = gaps.find((g) => g.skillId === rec.skillId);

    return {
      skillId: rec.skillId,
      skillName: rec.skill.name,
      skillSlug: rec.skill.slug,
      score: gap?.score ?? 0,
      floor: gap?.floor ?? floor,
      gap: gap?.gap ?? 0,
      modules,
      emptyContent: modules.length === 0,
    };
  });

  return {
    sourceAttemptId: latest.attemptId,
    latestResultId: latest.id,
    overallScore: latest.overallScore,
    passed: latest.passed,
    gaps,
    recommendations: items,
    retakeNote:
      "Completing recommended modules helps you learn, but skill gaps only update after you retake the assessment.",
  };
}

export async function getSkillDevelopment(userId: string) {
  const roleId = await getActiveRoleId(userId);
  const latest = await prisma.assessmentResult.findFirst({
    where: { userId, roleId },
    orderBy: { createdAt: "desc" },
  });
  if (latest) {
    await syncSnapshotProgress(userId, roleId, latest.attemptId);
  }

  const snapshots = await prisma.skillDevelopmentSnapshot.findMany({
    where: { userId, roleId },
    include: { skill: { select: { name: true, slug: true } } },
    orderBy: { updatedAt: "desc" },
  });

  const inProgress = snapshots.filter((s) => s.status === SkillDevelopmentStatus.IN_PROGRESS).length;
  const modulesCompleted = snapshots.filter(
    (s) => s.status === SkillDevelopmentStatus.MODULES_COMPLETED,
  ).length;

  return {
    summary: {
      openGaps: snapshots.length,
      inProgress,
      modulesCompleted,
      hasAssessment: Boolean(latest),
      overallScore: latest?.overallScore ?? null,
      passed: latest?.passed ?? null,
    },
    skills: snapshots.map((s) => ({
      skillId: s.skillId,
      skillName: s.skill.name,
      skillSlug: s.skill.slug,
      status: s.status,
      recommendedCompleted: s.recommendedCompleted,
      recommendedTotal: s.recommendedTotal,
      sourceAttemptId: s.sourceAttemptId,
      updatedAt: s.updatedAt.toISOString(),
    })),
  };
}

export async function listSkillMappings(skillId?: string) {
  const mappings = await prisma.skillModuleMapping.findMany({
    where: skillId ? { skillId } : undefined,
    include: {
      skill: { select: { name: true, slug: true } },
      module: {
        select: {
          id: true,
          slug: true,
          title: true,
          roadmap: { select: { role: { select: { name: true, slug: true } } } },
        },
      },
    },
    orderBy: [{ skillId: "asc" }, { priority: "asc" }],
  });
  return { mappings };
}

export async function upsertSkillMappings(
  mappings: { skillId: string; moduleId: string; priority?: number }[],
) {
  for (const m of mappings) {
    await prisma.skillModuleMapping.upsert({
      where: { skillId_moduleId: { skillId: m.skillId, moduleId: m.moduleId } },
      update: { priority: m.priority ?? 0 },
      create: {
        skillId: m.skillId,
        moduleId: m.moduleId,
        priority: m.priority ?? 0,
      },
    });
  }
  return listSkillMappings();
}
