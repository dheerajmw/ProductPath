import { PrismaClient } from "@prisma/client";

const COMMON_SKILLS = [
  { slug: "problem-solving", name: "Problem Solving" },
  { slug: "user-thinking", name: "User Thinking" },
  { slug: "communication", name: "Communication" },
  { slug: "analytical-thinking", name: "Analytical Thinking" },
];

const PM_SKILLS = [{ slug: "product-strategy", name: "Product Strategy" }];

type QSeed = {
  skillSlug: string;
  prompt: string;
  options: string[];
  correctIndex: number;
};

const PM_QUESTIONS: QSeed[] = [
  {
    skillSlug: "problem-solving",
    prompt: "A metric drops 15% week-over-week. What is the best first step?",
    options: [
      "Ship a hotfix feature immediately",
      "Form a hypothesis and check data quality/segmentation",
      "Increase marketing spend",
      "Pause all experiments",
    ],
    correctIndex: 1,
  },
  {
    skillSlug: "problem-solving",
    prompt: "Which framing best defines a product problem statement?",
    options: [
      "We need more engagement",
      "Users struggle to X when Y, causing Z",
      "Competitor X launched feature Y",
      "Engineering estimates are too high",
    ],
    correctIndex: 1,
  },
  {
    skillSlug: "user-thinking",
    prompt: "When is a survey LEAST appropriate?",
    options: [
      "Validating attitude toward a concept",
      "Discovering unknown pain points without interviews",
      "Measuring satisfaction after release",
      "Prioritizing known feature requests",
    ],
    correctIndex: 1,
  },
  {
    skillSlug: "user-thinking",
    prompt: "Jobs-to-be-Done focuses on:",
    options: [
      "User demographics",
      "Progress a user is trying to make in a circumstance",
      "UI component libraries",
      "Sprint velocity",
    ],
    correctIndex: 1,
  },
  {
    skillSlug: "communication",
    prompt: "A PRD should primarily align stakeholders on:",
    options: [
      "Pixel-perfect mocks",
      "Problem, scope, success metrics, and open questions",
      "Sprint capacity",
      "Annual revenue targets only",
    ],
    correctIndex: 1,
  },
  {
    skillSlug: "communication",
    prompt: "Best practice for executive updates:",
    options: [
      "Share every ticket status",
      "Lead with outcome, insight, decision needed",
      "Avoid metrics",
      "Only report blockers",
    ],
    correctIndex: 1,
  },
  {
    skillSlug: "analytical-thinking",
    prompt: "North Star metrics should be:",
    options: [
      "Easy to game",
      "Tied to delivered customer value",
      "Always revenue on day one",
      "Identical for all products",
    ],
    correctIndex: 1,
  },
  {
    skillSlug: "analytical-thinking",
    prompt: "An A/B test with p=0.06 and planned α=0.05 means:",
    options: [
      "Ship the variant",
      "Do not conclude significance; consider sample size/duration",
      "Stop all tests forever",
      "Results are invalid",
    ],
    correctIndex: 1,
  },
  {
    skillSlug: "product-strategy",
    prompt: "Opportunity Solution Tree connects:",
    options: [
      "OKRs → outcomes → opportunities → solutions",
      "Design systems → components",
      "Bugs → hotfixes only",
      "Headcount → budget",
    ],
    correctIndex: 0,
  },
  {
    skillSlug: "product-strategy",
    prompt: "When prioritizing, ICE scores help by:",
    options: [
      "Replacing user research",
      "Structuring impact, confidence, and effort",
      "Eliminating engineering input",
      "Guaranteeing revenue",
    ],
    correctIndex: 1,
  },
  {
    skillSlug: "product-strategy",
    prompt: "A moat in product strategy is:",
    options: [
      "A UI color palette",
      "A defensible advantage that compounds over time",
      "Number of meetings per week",
      "Copying competitors faster",
    ],
    correctIndex: 1,
  },
];

export async function seedAssessment(prisma: PrismaClient) {
  const pmRole = await prisma.role.findUnique({ where: { slug: "product-management" } });
  if (!pmRole) return;

  const skillIds = new Map<string, string>();

  for (const s of COMMON_SKILLS) {
    const skill = await prisma.skill.upsert({
      where: { slug: s.slug },
      update: { name: s.name, roleId: null },
      create: { slug: s.slug, name: s.name, roleId: null },
    });
    skillIds.set(s.slug, skill.id);
  }

  for (const s of PM_SKILLS) {
    const skill = await prisma.skill.upsert({
      where: { slug: s.slug },
      update: { name: s.name, roleId: pmRole.id },
      create: { slug: s.slug, name: s.name, roleId: pmRole.id },
    });
    skillIds.set(s.slug, skill.id);
  }

  const assessment = await prisma.assessment.upsert({
    where: { roleId_version: { roleId: pmRole.id, version: 1 } },
    update: {
      title: "Product Management Readiness Assessment",
      description: "Measures foundational PM skills and common product competencies.",
      durationMinutes: 45,
      published: true,
    },
    create: {
      roleId: pmRole.id,
      version: 1,
      title: "Product Management Readiness Assessment",
      description: "Measures foundational PM skills and common product competencies.",
      durationMinutes: 45,
      published: true,
    },
  });

  let order = 0;
  for (const q of PM_QUESTIONS) {
    const skillId = skillIds.get(q.skillSlug)!;
    const existing = await prisma.question.findFirst({
      where: { assessmentId: assessment.id, prompt: q.prompt },
    });
    if (existing) {
      await prisma.question.update({
        where: { id: existing.id },
        data: {
          options: q.options,
          correctIndex: q.correctIndex,
          skillId,
          sortOrder: order++,
        },
      });
    } else {
      await prisma.question.create({
        data: {
          assessmentId: assessment.id,
          skillId,
          prompt: q.prompt,
          options: q.options,
          correctIndex: q.correctIndex,
          sortOrder: order++,
        },
      });
    }
  }

  await prisma.featureFlag.upsert({
    where: { key: "phase2_assessment" },
    update: { enabled: true },
    create: { key: "phase2_assessment", enabled: true, description: "Skill assessments" },
  });

  console.log(`Seeded PM assessment: ${PM_QUESTIONS.length} questions`);
}
