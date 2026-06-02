import { PrismaClient } from "@prisma/client";

const PM_RUBRIC = {
  criteria: [
    { key: "problem_framing", label: "Problem framing & user insight", required: true, maxScore: 5 },
    { key: "solution_quality", label: "Solution quality & tradeoffs", required: true, maxScore: 5 },
    { key: "communication", label: "Clarity of communication", required: true, maxScore: 5 },
    { key: "evidence", label: "Evidence & reasoning", required: true, maxScore: 5 },
  ],
};

const PM_TEMPLATES = [
  {
    slug: "product-teardown",
    title: "Product Teardown",
    description: "Analyze an existing product’s strategy, UX, and growth loops.",
    instructions: `Pick a consumer or B2B product you can access without NDA barriers.
Document: target user, core job, key flows, metrics you’d track, and 3 prioritized improvements.
Include screenshots or a public link reviewers can open.`,
    sortOrder: 1,
  },
  {
    slug: "prd-exercise",
    title: "PRD Exercise",
    description: "Write a concise PRD for a scoped feature.",
    instructions: `Define problem, goals, non-goals, user stories, success metrics, and rollout plan.
Keep scope to one feature area achievable in a single squad quarter.`,
    sortOrder: 2,
  },
  {
    slug: "feature-proposal",
    title: "Feature Proposal",
    description: "Propose a new feature with prioritization rationale.",
    instructions: `Include opportunity sizing, alternatives considered, risks, and an experiment plan.
Tie recommendations to user evidence (research, data, or structured assumptions).`,
    sortOrder: 3,
  },
];

export async function seedProjects(prisma: PrismaClient) {
  const pmRole = await prisma.role.findUnique({ where: { slug: "product-management" } });
  if (!pmRole) {
    console.warn("PM role not found; skip project seed");
    return;
  }

  for (const t of PM_TEMPLATES) {
    await prisma.projectTemplate.upsert({
      where: { roleId_slug: { roleId: pmRole.id, slug: t.slug } },
      update: {
        title: t.title,
        description: t.description,
        instructions: t.instructions,
        rubric: PM_RUBRIC,
        published: true,
        sortOrder: t.sortOrder,
      },
      create: {
        roleId: pmRole.id,
        slug: t.slug,
        title: t.title,
        description: t.description,
        instructions: t.instructions,
        rubric: PM_RUBRIC,
        published: true,
        sortOrder: t.sortOrder,
      },
    });
  }

  await prisma.featureFlag.upsert({
    where: { key: "phase4_projects" },
    update: { enabled: true },
    create: { key: "phase4_projects", enabled: true, description: "Proof-of-work projects" },
  });

  console.log(`Seeded ${PM_TEMPLATES.length} PM project templates`);
}
