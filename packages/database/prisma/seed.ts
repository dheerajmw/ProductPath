import { PrismaClient, PlatformRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PRODUCT_ROLES = [
  {
    slug: "product-management",
    name: "Product Management",
    description: "Define strategy, roadmap, and deliver customer value.",
    sortOrder: 1,
  },
  {
    slug: "product-design",
    name: "Product Design",
    description: "Craft user experiences and visual design systems.",
    sortOrder: 2,
  },
  {
    slug: "product-analytics",
    name: "Product Analytics",
    description: "Turn data into product decisions and growth insights.",
    sortOrder: 3,
  },
  {
    slug: "product-marketing",
    name: "Product Marketing",
    description: "Position products and drive go-to-market success.",
    sortOrder: 4,
  },
  {
    slug: "product-operations",
    name: "Product Operations",
    description: "Scale product teams, processes, and execution.",
    sortOrder: 5,
  },
];

const VERIFICATION_CONFIG = {
  verification: {
    overall_pass_threshold: 70,
    skill_floor_threshold: 50,
    assessment_freshness_days: 180,
    grace_period_days: 30,
  },
  assessment: {
    max_attempts_per_version: 3,
    cooldown_days: 7,
    abandon_attempt_hours: 24,
  },
  learning: {
    assessment_warn_progress_pct: 50,
    assessment_block_progress_pct: 25,
  },
  projects: {
    max_submission_versions: 3,
    min_rejection_feedback_chars: 100,
  },
};

const FEATURE_FLAGS = [
  { key: "phase1_learning", enabled: true, description: "Learning roadmaps" },
  { key: "phase2_assessment", enabled: true, description: "Skill assessments" },
  { key: "phase3_recommendations", enabled: true, description: "Skill development recommendations" },
  { key: "phase4_projects", enabled: true, description: "Proof-of-work projects" },
  { key: "phase5_verification", enabled: true, description: "Verification state machine" },
  { key: "phase6_marketplace", enabled: true, description: "Talent marketplace" },
  { key: "phase7_community", enabled: true, description: "Community feed" },
];

async function main() {
  for (const role of PRODUCT_ROLES) {
    await prisma.role.upsert({
      where: { slug: role.slug },
      update: { name: role.name, description: role.description, sortOrder: role.sortOrder },
      create: role,
    });
  }

  await prisma.appConfig.upsert({
    where: { key: "verification_policy" },
    update: { value: VERIFICATION_CONFIG, version: { increment: 1 } },
    create: { key: "verification_policy", value: VERIFICATION_CONFIG },
  });

  for (const flag of FEATURE_FLAGS) {
    await prisma.featureFlag.upsert({
      where: { key: flag.key },
      update: { enabled: flag.enabled, description: flag.description },
      create: flag,
    });
  }

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@productpath.local";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "changeme-admin";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash, platformRole: PlatformRole.ADMIN, emailVerifiedAt: new Date() },
    create: {
      email: adminEmail,
      passwordHash,
      platformRole: PlatformRole.ADMIN,
      emailVerifiedAt: new Date(),
    },
  });

  console.log(`Seeded ${PRODUCT_ROLES.length} product roles`);
  console.log(`Seeded verification policy config`);
  console.log(`Seeded ${FEATURE_FLAGS.length} feature flags`);
  console.log(`Admin user: ${admin.email}`);

  const { seedLearning } = await import("./seed-learning");
  await seedLearning(prisma);

  const { seedAssessment } = await import("./seed-assessment");
  await seedAssessment(prisma);

  const { seedRecommendations } = await import("./seed-recommendations");
  await seedRecommendations(prisma);

  const { seedProjects } = await import("./seed-projects");
  await seedProjects(prisma);

  const { seedVerification } = await import("./seed-verification");
  await seedVerification(prisma);

  const { seedMarketplace } = await import("./seed-marketplace");
  await seedMarketplace(prisma);

  const { seedCommunity } = await import("./seed-community");
  await seedCommunity(prisma);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
