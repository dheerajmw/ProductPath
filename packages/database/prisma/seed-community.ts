import type { PrismaClient } from "@prisma/client";

export async function seedCommunity(prisma: PrismaClient) {
  await prisma.featureFlag.upsert({
    where: { key: "phase7_community" },
    update: { enabled: true },
    create: {
      key: "phase7_community",
      enabled: true,
      description: "Community feed, posts, comments, moderation",
    },
  });
  console.log("Seeded phase7_community feature flag");
}
