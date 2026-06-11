import { prisma } from "@productpath/database";
import { ModuleProgressStatus } from "@prisma/client";
import { writeAudit } from "../lib/audit";

export class LearningError extends Error {
  constructor(
    message: string,
    public statusCode = 400,
    public code?: string,
  ) {
    super(message);
    this.name = "LearningError";
  }
}

async function getCandidateProfile(userId: string) {
  const profile = await prisma.candidateProfile.findUnique({
    where: { userId },
    include: { activeRole: true },
  });
  if (!profile) {
    throw new LearningError("Candidate profile not found", 404);
  }
  return profile;
}

async function getPublishedRoadmap(roleId: string) {
  const roadmap = await prisma.roadmap.findFirst({
    where: { roleId, published: true },
    orderBy: { version: "desc" },
    include: {
      role: { select: { id: true, slug: true, name: true } },
      modules: {
        orderBy: { sortOrder: "asc" },
        include: {
          prerequisites: { include: { prerequisite: { select: { id: true, title: true } } } },
          resources: { orderBy: { sortOrder: "asc" } },
        },
      },
    },
  });
  if (!roadmap) {
    throw new LearningError("No roadmap published for this role", 404, "ROADMAP_NOT_FOUND");
  }
  return roadmap;
}

async function getModuleProgressMap(userId: string, roleId: string, moduleIds: string[]) {
  const rows = await prisma.userModuleProgress.findMany({
    where: { userId, roleId, moduleId: { in: moduleIds } },
  });
  return new Map(rows.map((r) => [r.moduleId, r]));
}

function isModuleCompleted(status: ModuleProgressStatus | undefined) {
  return status === ModuleProgressStatus.COMPLETED;
}

async function arePrerequisitesMet(
  module: { prerequisites: { prerequisiteId: string }[] },
  progressMap: Map<string, { status: ModuleProgressStatus }>,
) {
  for (const p of module.prerequisites) {
    const prog = progressMap.get(p.prerequisiteId);
    if (!isModuleCompleted(prog?.status)) {
      return false;
    }
  }
  return true;
}

export async function selectRole(
  userId: string,
  roleId: string,
  confirmArchive?: boolean,
  ipAddress?: string,
) {
  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) {
    throw new LearningError("Role not found", 404);
  }

  const profile = await getCandidateProfile(userId);

  if (profile.activeRoleId && profile.activeRoleId !== roleId) {
    if (!confirmArchive) {
      throw new LearningError(
        "Switching roles will archive progress for your current role. Set confirmArchive to true to continue.",
        409,
        "ROLE_SWITCH_REQUIRES_CONFIRM",
      );
    }

    await prisma.userRoleSelection.updateMany({
      where: { userId, active: true },
      data: { active: false, archivedAt: new Date() },
    });

    await writeAudit({
      userId,
      action: "learning.role_archived",
      entity: "Role",
      entityId: profile.activeRoleId,
      ipAddress,
    });
  }

  await prisma.userRoleSelection.create({
    data: { userId, roleId, active: true },
  });

  await prisma.candidateProfile.update({
    where: { userId },
    data: { activeRoleId: roleId },
  });

  await writeAudit({
    userId,
    action: "learning.role_selected",
    entity: "Role",
    entityId: roleId,
    ipAddress,
  });

  return { role, previousRoleId: profile.activeRoleId };
}

export async function getRoadmapForUser(userId: string) {
  const profile = await getCandidateProfile(userId);
  if (!profile.activeRoleId || !profile.activeRole) {
    throw new LearningError("Select a product role first", 400, "NO_ACTIVE_ROLE");
  }

  const roadmap = await getPublishedRoadmap(profile.activeRoleId);
  const moduleIds = roadmap.modules.map((m) => m.id);
  const progressMap = await getModuleProgressMap(userId, profile.activeRoleId, moduleIds);

  const modules = await Promise.all(
    roadmap.modules.map(async (mod) => {
      const progress = progressMap.get(mod.id);
      const prerequisitesMet = await arePrerequisitesMet(
        { prerequisites: mod.prerequisites.map((p) => ({ prerequisiteId: p.prerequisiteId })) },
        progressMap,
      );
      const requiredCount = mod.resources.filter((r) => r.required).length;
      const resourceProgress = await prisma.userResourceProgress.findMany({
        where: {
          userId,
          resourceId: { in: mod.resources.map((r) => r.id) },
          completed: true,
        },
      });
      const completedRequired = mod.resources.filter(
        (r) => r.required && resourceProgress.some((rp) => rp.resourceId === r.id),
      ).length;

      return {
        id: mod.id,
        slug: mod.slug,
        title: mod.title,
        description: mod.description,
        sortOrder: mod.sortOrder,
        status: progress?.status ?? ModuleProgressStatus.NOT_STARTED,
        prerequisitesMet,
        locked: !prerequisitesMet,
        requiredResourcesTotal: requiredCount,
        requiredResourcesCompleted: completedRequired,
        prerequisites: mod.prerequisites.map((p) => ({
          id: p.prerequisite.id,
          title: p.prerequisite.title,
        })),
      };
    }),
  );

  const completedCount = modules.filter((m) => m.status === ModuleProgressStatus.COMPLETED).length;
  const progressPercent =
    modules.length > 0 ? Math.round((completedCount / modules.length) * 100) : 0;

  return {
    roadmap: {
      id: roadmap.id,
      title: roadmap.title,
      description: roadmap.description,
      version: roadmap.version,
    },
    role: profile.activeRole,
    modules,
    progress: {
      completedModules: completedCount,
      totalModules: modules.length,
      percent: progressPercent,
      label: "Learning progress",
      hiringReadiness: false,
    },
  };
}

export async function getModuleForUser(userId: string, moduleId: string) {
  const profile = await getCandidateProfile(userId);
  if (!profile.activeRoleId) {
    throw new LearningError("Select a product role first", 400, "NO_ACTIVE_ROLE");
  }

  const mod = await prisma.module.findUnique({
    where: { id: moduleId },
    include: {
      roadmap: true,
      prerequisites: { include: { prerequisite: { select: { id: true, title: true } } } },
      resources: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!mod) {
    throw new LearningError("Module not found", 404, "MODULE_NOT_FOUND");
  }

  if (mod.roadmap.roleId !== profile.activeRoleId) {
    throw new LearningError(
      "This module belongs to a different role. Switch roles or open your active role roadmap.",
      404,
      "MODULE_ROLE_MISMATCH",
    );
  }

  const allModuleIds = (
    await prisma.module.findMany({
      where: { roadmapId: mod.roadmapId },
      select: { id: true },
    })
  ).map((m) => m.id);

  const fullProgressMap = await getModuleProgressMap(userId, profile.activeRoleId, allModuleIds);

  const prerequisitesMet = await arePrerequisitesMet(
    { prerequisites: mod.prerequisites.map((p) => ({ prerequisiteId: p.prerequisiteId })) },
    fullProgressMap,
  );

  const resourceProgress = await prisma.userResourceProgress.findMany({
    where: { userId, resourceId: { in: mod.resources.map((r) => r.id) } },
  });
  const rpMap = new Map(resourceProgress.map((r) => [r.resourceId, r]));

  let moduleProgress = await prisma.userModuleProgress.findUnique({
    where: {
      userId_moduleId_roleId: {
        userId,
        moduleId,
        roleId: profile.activeRoleId,
      },
    },
  });

  if (!moduleProgress && prerequisitesMet) {
    moduleProgress = await prisma.userModuleProgress.create({
      data: {
        userId,
        moduleId,
        roleId: profile.activeRoleId,
        status: ModuleProgressStatus.NOT_STARTED,
      },
    });
  }

  const resources = mod.resources.map((r) => ({
    id: r.id,
    title: r.title,
    type: r.type,
    url: r.url,
    content: r.content,
    required: r.required,
    sortOrder: r.sortOrder,
    completed: rpMap.get(r.id)?.completed ?? false,
  }));

  const requiredResources = resources.filter((r) => r.required);
  const allRequiredDone = requiredResources.every((r) => r.completed);

  return {
    module: {
      id: mod.id,
      slug: mod.slug,
      title: mod.title,
      description: mod.description,
      prerequisitesMet,
      locked: !prerequisitesMet,
      status: moduleProgress?.status ?? ModuleProgressStatus.NOT_STARTED,
    },
    resources,
    canComplete: prerequisitesMet && allRequiredDone && requiredResources.length > 0,
    prerequisites: mod.prerequisites.map((p) => ({
      id: p.prerequisite.id,
      title: p.prerequisite.title,
    })),
  };
}

export async function toggleResourceProgress(
  userId: string,
  resourceId: string,
  completed: boolean,
) {
  const profile = await getCandidateProfile(userId);
  if (!profile.activeRoleId) {
    throw new LearningError("Select a product role first", 400, "NO_ACTIVE_ROLE");
  }

  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
    include: { module: { include: { roadmap: true } } },
  });

  if (!resource || resource.module.roadmap.roleId !== profile.activeRoleId) {
    throw new LearningError("Resource not found", 404);
  }

  const mod = resource.module;
  const allModuleIds = (
    await prisma.module.findMany({ where: { roadmapId: mod.roadmapId }, select: { id: true } })
  ).map((m) => m.id);
  const progressMap = await getModuleProgressMap(userId, profile.activeRoleId, allModuleIds);

  const prerequisitesMet = await arePrerequisitesMet(
    {
      prerequisites: await prisma.modulePrerequisite.findMany({
        where: { moduleId: mod.id },
        select: { prerequisiteId: true },
      }),
    },
    progressMap,
  );

  if (!prerequisitesMet) {
    throw new LearningError("Complete prerequisite modules first", 403, "PREREQUISITES_NOT_MET");
  }

  await prisma.userResourceProgress.upsert({
    where: { userId_resourceId: { userId, resourceId } },
    create: {
      userId,
      resourceId,
      completed,
      completedAt: completed ? new Date() : null,
    },
    update: {
      completed,
      completedAt: completed ? new Date() : null,
    },
  });

  const existing = progressMap.get(mod.id);
  if (!existing || existing.status === ModuleProgressStatus.NOT_STARTED) {
    await prisma.userModuleProgress.upsert({
      where: {
        userId_moduleId_roleId: { userId, moduleId: mod.id, roleId: profile.activeRoleId },
      },
      create: {
        userId,
        moduleId: mod.id,
        roleId: profile.activeRoleId,
        status: ModuleProgressStatus.IN_PROGRESS,
      },
      update: { status: ModuleProgressStatus.IN_PROGRESS },
    });
  }

  return getModuleForUser(userId, mod.id);
}

export async function completeModule(userId: string, moduleId: string) {
  const detail = await getModuleForUser(userId, moduleId);

  if (detail.module.locked) {
    throw new LearningError("Complete prerequisite modules first", 403, "PREREQUISITES_NOT_MET");
  }

  if (!detail.canComplete) {
    throw new LearningError(
      "Complete all required resources before marking this module done",
      400,
      "REQUIRED_RESOURCES_INCOMPLETE",
    );
  }

  const profile = await getCandidateProfile(userId);

  await prisma.userModuleProgress.upsert({
    where: {
      userId_moduleId_roleId: {
        userId,
        moduleId,
        roleId: profile.activeRoleId!,
      },
    },
    create: {
      userId,
      moduleId,
      roleId: profile.activeRoleId!,
      status: ModuleProgressStatus.COMPLETED,
      completedAt: new Date(),
    },
    update: {
      status: ModuleProgressStatus.COMPLETED,
      completedAt: new Date(),
    },
  });

  return getModuleForUser(userId, moduleId);
}

export async function getLearningProgress(userId: string) {
  return getRoadmapForUser(userId).then((r) => r.progress);
}

/** Used by Phase 2 learning gate (D-05). Returns null if no active role / roadmap. */
export async function getLearningProgressPercent(userId: string): Promise<number | null> {
  try {
    const data = await getRoadmapForUser(userId);
    return data.progress.percent;
  } catch (e) {
    if (e instanceof LearningError && e.code === "NO_ACTIVE_ROLE") return null;
    throw e;
  }
}
