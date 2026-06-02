import { PrismaClient } from "@prisma/client";

export async function seedMarketplace(prisma: PrismaClient) {
  await prisma.featureFlag.upsert({
    where: { key: "phase6_marketplace" },
    update: { enabled: true },
    create: {
      key: "phase6_marketplace",
      enabled: true,
      description: "Talent marketplace and interest requests",
    },
  });

  console.log("Seeded phase6_marketplace feature flag");
}
