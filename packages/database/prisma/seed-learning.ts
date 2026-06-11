import { PrismaClient, ResourceType } from "@prisma/client";
import { buildSeedModulesForRole, getCurriculumForRole } from "@productpath/shared";

type ResourceSeed = {
  title: string;
  type: ResourceType;
  content?: string;
  url?: string;
  required: boolean;
  sortOrder: number;
};

type ModuleSeed = {
  slug: string;
  title: string;
  description: string;
  sortOrder: number;
  prerequisites: string[];
  resources: ResourceSeed[];
};

type RoadmapSeed = {
  roleSlug: string;
  title: string;
  description: string;
  modules: ModuleSeed[];
};

function roadmapSeedForRole(roleSlug: string): RoadmapSeed | null {
  const curriculum = getCurriculumForRole(roleSlug);
  const modules = buildSeedModulesForRole(roleSlug);
  if (!curriculum || !modules) return null;

  const topicCount = curriculum.phases.reduce((sum, phase) => sum + phase.topics.length, 0);

  return {
    roleSlug,
    title: curriculum.title,
    description: `${topicCount} topics across ${curriculum.phases.length} phases — structured learning with curated resources.`,
    modules: modules.map((mod) => ({
      ...mod,
      resources: mod.resources.map((res) => ({
        ...res,
        type: res.type as ResourceType,
      })),
    })),
  };
}

const CURRICULUM_ROLE_SLUGS = [
  "product-management",
  "product-design",
  "product-analytics",
  "product-marketing",
  "product-operations",
] as const;

const ROADMAP_SEEDS: RoadmapSeed[] = CURRICULUM_ROLE_SLUGS.map(roadmapSeedForRole).filter(
  (seed): seed is RoadmapSeed => seed !== null,
);

async function seedRoadmapForRole(prisma: PrismaClient, seed: RoadmapSeed) {
  const role = await prisma.role.findUnique({ where: { slug: seed.roleSlug } });
  if (!role) {
    console.warn(`Role ${seed.roleSlug} not found; skip learning seed`);
    return;
  }

  const roadmap = await prisma.roadmap.upsert({
    where: { roleId_version: { roleId: role.id, version: 1 } },
    update: {
      title: seed.title,
      description: seed.description,
      published: true,
    },
    create: {
      roleId: role.id,
      version: 1,
      title: seed.title,
      description: seed.description,
      published: true,
    },
  });

  const moduleIdBySlug = new Map<string, string>();

  for (const mod of seed.modules) {
    const created = await prisma.module.upsert({
      where: { roadmapId_slug: { roadmapId: roadmap.id, slug: mod.slug } },
      update: {
        title: mod.title,
        description: mod.description,
        sortOrder: mod.sortOrder,
      },
      create: {
        roadmapId: roadmap.id,
        slug: mod.slug,
        title: mod.title,
        description: mod.description,
        sortOrder: mod.sortOrder,
      },
    });
    moduleIdBySlug.set(mod.slug, created.id);

    for (const res of mod.resources) {
      const existing = await prisma.resource.findFirst({
        where: { moduleId: created.id, title: res.title },
      });
      if (existing) {
        await prisma.resource.update({ where: { id: existing.id }, data: res });
      } else {
        await prisma.resource.create({ data: { moduleId: created.id, ...res } });
      }
    }
  }

  for (const mod of seed.modules) {
    const moduleId = moduleIdBySlug.get(mod.slug)!;
    await prisma.modulePrerequisite.deleteMany({ where: { moduleId } });
    for (const prereqSlug of mod.prerequisites) {
      const prerequisiteId = moduleIdBySlug.get(prereqSlug);
      if (prerequisiteId) {
        await prisma.modulePrerequisite.create({
          data: { moduleId, prerequisiteId },
        });
      }
    }
  }

  const activeSlugs = new Set(seed.modules.map((m) => m.slug));
  await prisma.module.deleteMany({
    where: {
      roadmapId: roadmap.id,
      slug: { notIn: [...activeSlugs] },
    },
  });

  console.log(`Seeded ${seed.roleSlug} roadmap: ${roadmap.title} (${seed.modules.length} modules)`);
}

export async function seedLearning(prisma: PrismaClient) {
  for (const seed of ROADMAP_SEEDS) {
    await seedRoadmapForRole(prisma, seed);
  }

  await prisma.featureFlag.upsert({
    where: { key: "phase1_learning" },
    update: { enabled: true },
    create: { key: "phase1_learning", enabled: true, description: "Learning roadmaps" },
  });
}

/** Maps product role slug → static career roadmap slug in apps/web. */
export function careerRoadmapSlugForRole(roleSlug: string): string {
  return `ai-${roleSlug}`;
}
