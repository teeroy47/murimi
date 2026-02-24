import { Body, Controller, Delete, Get, Module, Param, Patch, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator";
import { AuditAction } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { Authz } from "src/common/decorators/authz.decorator";
import { PERMISSIONS } from "src/common/constants/permissions";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { AuditService } from "../audit/audit.service";
import { recordChangeCursor } from "src/common/utils/change-cursor";

class FeedTypeDto {
  @IsString() name!: string;
  @IsOptional() @IsString() notes?: string;
}
class RationPlanDto {
  @IsString() stage!: string;
  @IsUUID() feedTypeId!: string;
  @IsNumber() @Min(0) targetGPerHeadPerDay!: number;
  @IsOptional() scheduleJson?: unknown;
}
class FeedingEventDto {
  @IsOptional() @IsUUID() penId?: string;
  @IsOptional() @IsUUID() batchId?: string;
  @IsUUID() feedTypeId!: string;
  @IsNumber() totalAmountKg!: number;
  @IsNumber() headCount!: number;
  @IsString() eventDate!: string;
  @IsOptional() @IsString() notes?: string;
}
class WeightRecordDto {
  @IsOptional() @IsUUID() animalId?: string;
  @IsOptional() @IsUUID() batchId?: string;
  @IsNumber() weightKg!: number;
  @IsString() recordedAt!: string;
  @IsOptional() @IsString() notes?: string;
}
class WaterCheckDto {
  @IsUUID() penId!: string;
  @IsBoolean() isAvailable!: boolean;
  @IsOptional() @IsString() notes?: string;
  @IsString() checkedAt!: string;
}

@ApiTags("Nutrition")
@Controller()
class NutritionController {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  @Get("farms/:farmId/feed-types")
  @Authz({ farm: true, permissions: [PERMISSIONS.NUTRITION_VIEW] })
  listFeedTypes(@Param("farmId") farmId: string) {
    return this.prisma.feedType.findMany({ where: { farmId, deletedAt: null } });
  }

  @Post("farms/:farmId/feed-types")
  @Authz({ farm: true, permissions: [PERMISSIONS.NUTRITION_EDIT] })
  async createFeedType(@Param("farmId") farmId: string, @Body() dto: FeedTypeDto, @CurrentUser() user: any) {
    const created = await this.prisma.feedType.create({ data: { farmId, ...dto } });
    await recordChangeCursor(this.prisma, { farmId, entityType: "FeedType", entityId: created.id, version: created.version });
    await this.audit.logWrite({ farmId, actorUserId: user.userId, entityType: "FeedType", entityId: created.id, action: AuditAction.CREATE, afterJson: created });
    return created;
  }

  @Patch("feed-types/:id")
  @Authz({ farm: true, permissions: [PERMISSIONS.NUTRITION_EDIT] })
  async patchFeedType(@Param("id") id: string, @Body() dto: FeedTypeDto, @CurrentUser() user: any) {
    const before = await this.prisma.feedType.findFirst({ where: { id, farmId: user.activeFarmId } });
    if (!before) return null;
    const updated = await this.prisma.feedType.update({ where: { id }, data: { ...dto, version: { increment: 1 } } });
    await recordChangeCursor(this.prisma, { farmId: user.activeFarmId, entityType: "FeedType", entityId: id, version: updated.version });
    await this.audit.logWrite({ farmId: user.activeFarmId, actorUserId: user.userId, entityType: "FeedType", entityId: id, action: AuditAction.UPDATE, beforeJson: before, afterJson: updated });
    return updated;
  }

  @Delete("feed-types/:id")
  @Authz({ farm: true, permissions: [PERMISSIONS.NUTRITION_EDIT] })
  async deleteFeedType(@Param("id") id: string, @CurrentUser() user: any) {
    const before = await this.prisma.feedType.findFirst({ where: { id, farmId: user.activeFarmId } });
    if (!before) return null;
    const updated = await this.prisma.feedType.update({ where: { id }, data: { deletedAt: new Date(), version: { increment: 1 } } });
    await recordChangeCursor(this.prisma, { farmId: user.activeFarmId, entityType: "FeedType", entityId: id, version: updated.version, deletedAt: updated.deletedAt });
    await this.audit.logWrite({ farmId: user.activeFarmId, actorUserId: user.userId, entityType: "FeedType", entityId: id, action: AuditAction.DELETE, beforeJson: before, afterJson: updated });
    return { deleted: true };
  }

  @Get("farms/:farmId/ration-plans")
  @Authz({ farm: true, permissions: [PERMISSIONS.NUTRITION_VIEW] })
  listRationPlans(@Param("farmId") farmId: string) {
    return this.prisma.rationPlan.findMany({ where: { farmId, deletedAt: null }, include: { feedType: true } });
  }

  @Post("farms/:farmId/ration-plans")
  @Authz({ farm: true, permissions: [PERMISSIONS.NUTRITION_EDIT] })
  async createRationPlan(@Param("farmId") farmId: string, @Body() dto: RationPlanDto, @CurrentUser() user: any) {
    const created = await this.prisma.rationPlan.create({ data: { farmId, ...dto, scheduleJson: dto.scheduleJson as any } });
    await this.audit.logWrite({ farmId, actorUserId: user.userId, entityType: "RationPlan", entityId: created.id, action: AuditAction.CREATE, afterJson: created });
    return created;
  }

  @Patch("ration-plans/:id")
  @Authz({ farm: true, permissions: [PERMISSIONS.NUTRITION_EDIT] })
  async patchRationPlan(@Param("id") id: string, @Body() dto: Partial<RationPlanDto>, @CurrentUser() user: any) {
    const before = await this.prisma.rationPlan.findFirst({ where: { id, farmId: user.activeFarmId } });
    if (!before) return null;
    const updated = await this.prisma.rationPlan.update({ where: { id }, data: { ...dto, version: { increment: 1 } } as any });
    await this.audit.logWrite({ farmId: user.activeFarmId, actorUserId: user.userId, entityType: "RationPlan", entityId: id, action: AuditAction.UPDATE, beforeJson: before, afterJson: updated });
    return updated;
  }

  @Delete("ration-plans/:id")
  @Authz({ farm: true, permissions: [PERMISSIONS.NUTRITION_EDIT] })
  async deleteRationPlan(@Param("id") id: string, @CurrentUser() user: any) {
    const before = await this.prisma.rationPlan.findFirst({ where: { id, farmId: user.activeFarmId } });
    if (!before) return null;
    const updated = await this.prisma.rationPlan.update({ where: { id }, data: { deletedAt: new Date(), version: { increment: 1 } } });
    await this.audit.logWrite({ farmId: user.activeFarmId, actorUserId: user.userId, entityType: "RationPlan", entityId: id, action: AuditAction.DELETE, beforeJson: before, afterJson: updated });
    return { deleted: true };
  }

  @Post("farms/:farmId/feeding-events")
  @Authz({ farm: true, permissions: [PERMISSIONS.NUTRITION_EDIT] })
  async createFeedingEvent(@Param("farmId") farmId: string, @Body() dto: FeedingEventDto, @CurrentUser() user: any) {
    const created = await this.prisma.feedingEvent.create({ data: { ...dto, farmId, eventDate: new Date(dto.eventDate) } as any });
    await this.audit.logWrite({ farmId, actorUserId: user.userId, entityType: "FeedingEvent", entityId: created.id, action: AuditAction.CREATE, afterJson: created });
    return created;
  }

  @Post("farms/:farmId/weight-records")
  @Authz({ farm: true, permissions: [PERMISSIONS.NUTRITION_EDIT] })
  async createWeightRecord(@Param("farmId") farmId: string, @Body() dto: WeightRecordDto, @CurrentUser() user: any) {
    const created = await this.prisma.weightRecord.create({ data: { ...dto, farmId, recordedAt: new Date(dto.recordedAt) } as any });
    await recordChangeCursor(this.prisma, { farmId, entityType: "WeightRecord", entityId: created.id, version: created.version });
    await this.audit.logWrite({ farmId, actorUserId: user.userId, entityType: "WeightRecord", entityId: created.id, action: AuditAction.CREATE, afterJson: created });
    return created;
  }

  @Post("farms/:farmId/water-checks")
  @Authz({ farm: true, permissions: [PERMISSIONS.NUTRITION_EDIT] })
  async createWaterCheck(@Param("farmId") farmId: string, @Body() dto: WaterCheckDto, @CurrentUser() user: any) {
    const created = await this.prisma.waterCheck.create({ data: { ...dto, farmId, checkedAt: new Date(dto.checkedAt) } as any });
    await this.audit.logWrite({ farmId, actorUserId: user.userId, entityType: "WaterCheck", entityId: created.id, action: AuditAction.CREATE, afterJson: created });
    return created;
  }
}

@Module({ providers: [], controllers: [NutritionController] })
export class NutritionModule {}
