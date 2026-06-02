import { PrismaClient, ResourceType } from "@prisma/client";

export async function seedLearning(prisma: PrismaClient) {
  const pmRole = await prisma.role.findUnique({
    where: { slug: "product-management" },
  });
  if (!pmRole) {
    console.warn("PM role not found; skip learning seed");
    return;
  }

  const roadmap = await prisma.roadmap.upsert({
    where: { roleId_version: { roleId: pmRole.id, version: 1 } },
    update: {
      title: "Product Management Foundations",
      description: "Core skills and concepts for aspiring product managers.",
      published: true,
    },
    create: {
      roleId: pmRole.id,
      version: 1,
      title: "Product Management Foundations",
      description: "Core skills and concepts for aspiring product managers.",
      published: true,
    },
  });

  const modules = [
    {
      slug: "intro-to-pm",
      title: "Introduction to Product Management",
      description: "What PMs do, how they create value, and how the role fits in a product team.",
      sortOrder: 1,
      prerequisites: [] as string[],
      resources: [
        {
          title: "What is Product Management?",
          type: ResourceType.ARTICLE,
          content:
            "Product managers align user needs, business goals, and technical feasibility. They own the why and what—not always the how.",
          required: true,
          sortOrder: 1,
        },
        {
          title: "PM Role in Tech Teams",
          type: ResourceType.EXTERNAL_LINK,
          url: "https://www.mindtheproduct.com/learn/product-management/",
          required: true,
          sortOrder: 2,
        },
      ],
    },
    {
      slug: "user-research-basics",
      title: "User Research Basics",
      description: "Learn how to frame problems and gather evidence from users.",
      sortOrder: 2,
      prerequisites: ["intro-to-pm"],
      resources: [
        {
          title: "Problem vs Solution Space",
          type: ResourceType.ARTICLE,
          content:
            "Stay in the problem space until you have evidence. Solution ideas come after you understand jobs, pains, and gains.",
          required: true,
          sortOrder: 1,
        },
        {
          title: "Interviewing Users (Video)",
          type: ResourceType.VIDEO,
          url: "https://www.youtube.com/watch?v=MT4Ig2uqjTc",
          required: true,
          sortOrder: 2,
        },
        {
          title: "Optional: Research Plan Template",
          type: ResourceType.PDF,
          url: "https://www.nngroup.com/reports/topic/ux-research/",
          required: false,
          sortOrder: 3,
        },
      ],
    },
    {
      slug: "roadmapping",
      title: "Roadmapping & Prioritization",
      description: "Turn insights into a focused roadmap and communicate tradeoffs.",
      sortOrder: 3,
      prerequisites: ["user-research-basics"],
      resources: [
        {
          title: "Outcome-Based Roadmaps",
          type: ResourceType.ARTICLE,
          content:
            "Roadmaps should communicate outcomes and learning goals—not a laundry list of features with fake dates.",
          required: true,
          sortOrder: 1,
        },
        {
          title: "Prioritization Frameworks",
          type: ResourceType.EXTERNAL_LINK,
          url: "https://www.productplan.com/learn/prioritization-frameworks/",
          required: true,
          sortOrder: 2,
        },
      ],
    },
  ];

  const moduleIdBySlug = new Map<string, string>();

  for (const mod of modules) {
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
        await prisma.resource.update({
          where: { id: existing.id },
          data: res,
        });
      } else {
        await prisma.resource.create({
          data: { moduleId: created.id, ...res },
        });
      }
    }
  }

  for (const mod of modules) {
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

  await prisma.featureFlag.upsert({
    where: { key: "phase1_learning" },
    update: { enabled: true },
    create: { key: "phase1_learning", enabled: true, description: "Learning roadmaps" },
  });

  console.log(`Seeded PM roadmap: ${roadmap.title} (${modules.length} modules)`);
}
