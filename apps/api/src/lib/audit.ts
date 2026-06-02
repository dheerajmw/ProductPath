import { prisma, type Prisma } from "@productpath/database";

export async function writeAudit(params: {
  userId?: string;
  action: string;
  entity?: string;
  entityId?: string;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string;
}) {
  await prisma.auditLog.create({
    data: {
      userId: params.userId,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      metadata: params.metadata,
      ipAddress: params.ipAddress,
    },
  });
}
