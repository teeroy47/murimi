import { PrismaService } from "src/prisma/prisma.service";

export async function recordChangeCursor(
  prisma: PrismaService,
  input: {
    farmId: string;
    entityType: string;
    entityId: string;
    version: number;
    deletedAt?: Date | null;
  },
) {
  await prisma.changeCursor.create({
    data: {
      farmId: input.farmId,
      entityType: input.entityType,
      entityId: input.entityId,
      version: input.version,
      deletedAt: input.deletedAt ?? null,
    },
  });
}
