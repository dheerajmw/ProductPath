import { PrismaClient } from "@prisma/client";

export async function seedVerification(prisma: PrismaClient) {
  await prisma.featureFlag.upsert({
    where: { key: "phase5_verification" },
    update: { enabled: true },
    create: {
      key: "phase5_verification",
      enabled: true,
      description: "Verification state machine and badges",
    },
  });

  console.log("Seeded phase5_verification feature flag");
}
