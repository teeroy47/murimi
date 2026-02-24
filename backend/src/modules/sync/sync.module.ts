import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Module,
  Post,
  Query,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { IsArray, IsEnum, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { AuditAction, SyncOperation } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { Authz } from "src/common/decorators/authz.decorator";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { AuditService } from "../audit/audit.service";
import { recordChangeCursor } from "src/common/utils/change-cursor";

class SyncChangeDto {
  @IsString() entityType!: string;
  @IsString() entityId!: string;
  @IsEnum(SyncOperation) op!: SyncOperation;
  @IsOptional() baseVersion?: number;
  payload?: Record<string, unknown>;
  @IsOptional() @IsString() clientTimestamp?: string;
  @IsString() clientMutationId!: string;
}

class SyncPushDto {
  @IsString() deviceId!: string;
  @IsString() farmId!: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => SyncChangeDto) changes!: SyncChangeDto[];
}

class ResolveConflictDto {
  @IsString() farmId!: string;
  @IsString() deviceId!: string;
  @IsString() entityType!: string;
  @IsString() entityId!: string;
  @IsString() resolution!: "KEEP_MINE" | "KEEP_SERVER";
  baseServerVersion!: number;
  @IsOptional() payloadIfKeepMine?: Record<string, unknown>;
}

export function hasVersionConflict(baseVersion: number | undefined, currentVersion: number) {
  return baseVersion !== currentVersion;
}

function permissionForSync(entityType: string, op: SyncOperation): string {
  const map: Record<string, { view: string; edit: string }> = {
    Animal: { view: "animals.view", edit: "animals.edit" },
    FeedType: { view: "nutrition.view", edit: "nutrition.edit" },
    WeightRecord: { view: "nutrition.view", edit: "nutrition.edit" },
    TreatmentEvent: { view: "health.view", edit: "health.edit" },
    SlaughterRule: { view: "slaughter.view", edit: "slaughter.edit" },
    FarmMap: { view: "map.view", edit: "map.edit" },
  };
  const entry = map[entityType];
  if (!entry) return "unsupported";
  return op === SyncOperation.UPDATE || op === SyncOperation.CREATE || op === SyncOperation.DELETE ? entry.edit : entry.view;
}

@ApiTags("Sync")
@Controller("sync")
class SyncController {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  private async getDelegate(entityType: string) {
    switch (entityType) {
      case "Animal": return this.prisma.animal;
      case "FeedType": return this.prisma.feedType;
      case "WeightRecord": return this.prisma.weightRecord;
      case "TreatmentEvent": return this.prisma.treatmentEvent;
      case "SlaughterRule": return this.prisma.slaughterRule;
      case "FarmMap": return this.prisma.farmMap;
      default: return null;
    }
  }

  @Post("push")
  @Authz({ farm: true })
  async push(@Body() dto: SyncPushDto, @CurrentUser() user: any) {
    if (dto.farmId !== user.activeFarmId) throw new BadRequestException("farmId mismatch with active farm");

    await this.prisma.clientDevice.upsert({
      where: { id: dto.deviceId },
      create: { id: dto.deviceId, farmId: dto.farmId, userId: user.userId, deviceName: "Unknown" },
      update: { lastSeenAt: new Date() },
    });

    const results: any[] = [];

    for (const change of dto.changes) {
      const neededPerm = permissionForSync(change.entityType, change.op);
      if (neededPerm === "unsupported" || !(user.permissions ?? []).includes(neededPerm)) {
        results.push({ entityId: change.entityId, clientMutationId: change.clientMutationId, status: "rejected", reason: "Unsupported entity or permission denied" });
        continue;
      }

      const existingMutation = await this.prisma.syncMutationLog.findFirst({
        where: { deviceId: dto.deviceId, clientMutationId: change.clientMutationId },
      });
      if (existingMutation) {
        results.push({ entityId: change.entityId, clientMutationId: change.clientMutationId, status: "applied", idempotent: true, result: existingMutation.resultJson });
        continue;
      }

      const delegate: any = await this.getDelegate(change.entityType);
      if (!delegate) {
        results.push({ entityId: change.entityId, clientMutationId: change.clientMutationId, status: "rejected", reason: "Unsupported entity" });
        continue;
      }

      // Strong sync rule:
      // - CREATE succeeds only when the client-supplied ID is absent.
      // - UPDATE/DELETE require baseVersion to exactly match current server version.
      // This makes conflicts explicit and prevents silent lost updates.
      const current = await delegate.findFirst?.({
        where: { id: change.entityId, farmId: dto.farmId },
      });

      try {
        let appliedResult: any;
        if (change.op === SyncOperation.CREATE) {
          if (current) throw new BadRequestException("Entity already exists");
          appliedResult = await delegate.create({
            data: {
              id: change.entityId,
              farmId: dto.farmId,
              version: 1,
              ...(change.payload ?? {}),
            },
          });
        } else if (change.op === SyncOperation.UPDATE) {
          if (!current) throw new BadRequestException("Entity not found");
          if (hasVersionConflict(change.baseVersion, current.version)) {
            results.push({
              entityId: change.entityId,
              clientMutationId: change.clientMutationId,
              status: "conflict",
              conflict: {
                entityId: change.entityId,
                serverVersion: current.version,
                serverState: current,
                clientAttempt: change,
              },
            });
            continue;
          }
          appliedResult = await delegate.update({
            where: { id: change.entityId },
            data: { ...(change.payload ?? {}), version: { increment: 1 } },
          });
        } else {
          if (!current) throw new BadRequestException("Entity not found");
          if (hasVersionConflict(change.baseVersion, current.version)) {
            results.push({
              entityId: change.entityId,
              clientMutationId: change.clientMutationId,
              status: "conflict",
              conflict: {
                entityId: change.entityId,
                serverVersion: current.version,
                serverState: current,
                clientAttempt: change,
              },
            });
            continue;
          }
          appliedResult = await delegate.update({
            where: { id: change.entityId },
            data: { deletedAt: new Date(), version: { increment: 1 } },
          });
        }

        await recordChangeCursor(this.prisma, {
          farmId: dto.farmId,
          entityType: change.entityType,
          entityId: change.entityId,
          version: appliedResult.version ?? 1,
          deletedAt: appliedResult.deletedAt ?? null,
        });
        await this.audit.logWrite({
          farmId: dto.farmId,
          actorUserId: user.userId,
          entityType: change.entityType,
          entityId: change.entityId,
          action: AuditAction.SYNC_APPLY,
          deviceId: dto.deviceId,
          beforeJson: current ?? undefined,
          afterJson: appliedResult,
        });
        const resultJson = {
          status: "applied",
          newVersion: appliedResult.version ?? 1,
          serverTimestamp: new Date().toISOString(),
        };
        await this.prisma.syncMutationLog.create({
          data: {
            farmId: dto.farmId,
            deviceId: dto.deviceId,
            userId: user.userId,
            clientMutationId: change.clientMutationId,
            entityType: change.entityType,
            entityId: change.entityId,
            operation: change.op,
            resultJson,
          },
        });
        results.push({ entityId: change.entityId, clientMutationId: change.clientMutationId, ...resultJson });
      } catch (error: any) {
        results.push({ entityId: change.entityId, clientMutationId: change.clientMutationId, status: "rejected", reason: error.message ?? "Failed" });
      }
    }

    return { results };
  }

  @Get("pull")
  @Authz({ farm: true })
  async pull(@CurrentUser() user: any, @Query("sinceCursor") sinceCursor?: string) {
    const farmId = user.activeFarmId;
    const since = sinceCursor ? new Date(sinceCursor) : new Date(0);
    const changes = await this.prisma.changeCursor.findMany({
      where: { farmId, changedAt: { gt: since } },
      orderBy: { changedAt: "asc" },
      take: 500,
    });
    const grouped = changes.map((c) => ({
      entityType: c.entityType,
      entityId: c.entityId,
      version: c.version,
      changedAt: c.changedAt,
      deletedAt: c.deletedAt,
    }));
    const newCursor = changes.length ? changes[changes.length - 1].changedAt.toISOString() : since.toISOString();
    return { changes: grouped, newCursor };
  }

  @Post("resolve-conflict")
  @Authz({ farm: true })
  async resolveConflict(@Body() dto: ResolveConflictDto, @CurrentUser() user: any) {
    if (dto.farmId !== user.activeFarmId) throw new BadRequestException("farmId mismatch with active farm");
    const delegate: any = await this.getDelegate(dto.entityType);
    if (!delegate) throw new BadRequestException("Unsupported entityType");
    const current = await delegate.findFirst({ where: { id: dto.entityId, farmId: dto.farmId } });
    if (!current) throw new BadRequestException("Entity not found");

    // Conflict resolution semantics:
    // KEEP_SERVER is read-only acknowledgement and returns the authoritative state.
    // KEEP_MINE is a guarded retry and only applies if the client still targets the same
    // server version it originally conflicted with. If the server moved again, we fail fast
    // to avoid overwriting newer data created by another device/user.
    if (dto.resolution === "KEEP_SERVER") {
      await this.audit.logWrite({
        farmId: dto.farmId,
        actorUserId: user.userId,
        entityType: dto.entityType,
        entityId: dto.entityId,
        action: AuditAction.SYNC_APPLY,
        deviceId: dto.deviceId,
        afterJson: { resolution: "KEEP_SERVER", serverState: current },
      });
      return { resolution: "KEEP_SERVER", serverState: current };
    }

    if (dto.baseServerVersion !== current.version) {
      throw new BadRequestException("Server version changed again; refresh and retry");
    }
    const updated = await delegate.update({
      where: { id: dto.entityId },
      data: { ...(dto.payloadIfKeepMine ?? {}), version: { increment: 1 } },
    });
    await recordChangeCursor(this.prisma, { farmId: dto.farmId, entityType: dto.entityType, entityId: dto.entityId, version: updated.version, deletedAt: updated.deletedAt ?? null });
    await this.audit.logWrite({
      farmId: dto.farmId,
      actorUserId: user.userId,
      entityType: dto.entityType,
      entityId: dto.entityId,
      action: AuditAction.SYNC_APPLY,
      deviceId: dto.deviceId,
      beforeJson: current,
      afterJson: { resolution: "KEEP_MINE", applied: updated },
    });
    return { resolution: "KEEP_MINE", serverState: updated };
  }
}

@Module({
  controllers: [SyncController],
})
export class SyncModule {}
