import { PrismaClient } from "@prisma/client";

/** Skill slug → module slugs on the PM roadmap (priority order). */
const PM_SKILL_MODULE_MAP: Record<string, string[]> = {
  "problem-solving": ["intro-to-pm"],
  "user-thinking": ["user-research-basics"],
  communication: ["intro-to-pm", "user-research-basics"],
  "analytical-thinking": ["roadmapping"],
  "product-strategy": ["roadmapping"],
};

export async function seedRecommendations(prisma: PrismaClient) {
  const pmRole = await prisma.role.findUnique({ where: { slug: "product-management" } });
  if (!pmRole) {
    console.warn("PM role not found; skip recommendation seed");
    return;
  }

  const roadmap = await prisma.roadmap.findFirst({
    where: { roleId: pmRole.id, published: true },
    orderBy: { version: "desc" },
    include: { modules: true },
  });
  if (!roadmap) {
    console.warn("PM roadmap not found; skip recommendation seed");
    return;
  }

  const moduleBySlug = new Map(roadmap.modules.map((m) => [m.slug, m.id]));
  const skills = await prisma.skill.findMany();
  const skillBySlug = new Map(skills.map((s) => [s.slug, s.id]));

  let count = 0;
  for (const [skillSlug, moduleSlugs] of Object.entries(PM_SKILL_MODULE_MAP)) {
    const skillId = skillBySlug.get(skillSlug);
    if (!skillId) continue;

    let priority = 0;
    for (const moduleSlug of moduleSlugs) {
      const moduleId = moduleBySlug.get(moduleSlug);
      if (!moduleId) continue;

      await prisma.skillModuleMapping.upsert({
        where: { skillId_moduleId: { skillId, moduleId } },
        update: { priority },
        create: { skillId, moduleId, priority },
      });
      priority += 1;
      count += 1;
    }
  }

  await prisma.featureFlag.upsert({
    where: { key: "phase3_recommendations" },
    update: { enabled: true },
    create: {
      key: "phase3_recommendations",
      enabled: true,
      description: "Skill development recommendations from gaps",
    },
  });

  console.log(`Seeded ${count} skill→module mappings for PM`);
}
