import { Injectable } from "@nestjs/common";
import { AuditAction } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

export interface AuditWriteInput {
  farmId: string;
  actorUserId?: string;
  entityType: string;
  entityId: string;
  action: AuditAction;
  requestId?: string;
  deviceId?: string;
  beforeJson?: unknown;
  afterJson?: unknown;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async logWrite(input: AuditWriteInput) {
    return this.prisma.auditLog.create({
      data: {
        farmId: input.farmId,
        actorUserId: input.actorUserId,
        entityType: input.entityType,
        entityId: input.entityId,
        action: input.action,
        requestId: input.requestId,
        deviceId: input.deviceId,
        beforeJson: input.beforeJson as object | undefined,
        afterJson: input.afterJson as object | undefined,
      },
    });
  }
}
