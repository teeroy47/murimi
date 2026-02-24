import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Module,
  Param,
  Post,
  Query,
  Patch,
  Delete,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator";
import { AuditAction } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { Authz } from "src/common/decorators/authz.decorator";
import { PERMISSIONS } from "src/common/constants/permissions";
import { AuditService } from "../audit/audit.service";
import { CurrentUser } from "src/common/decorators/current-user.decorator";

class SlaughterRuleDto {
  @IsOptional() @IsString() livestockType?: string;
  @IsOptional() @IsString() stage?: string;
  @IsNumber() minWeightKg!: number;
  @IsNumber() maxWeightKg!: number;
  @IsOptional() @IsNumber() minAgeDays?: number;
  @IsOptional() @IsNumber() requireRecentWeightDays?: number;
  @IsOptional() @IsBoolean() blockIfWithdrawal?: boolean;
  @IsOptional() overrideRoleIds?: string[];
}

class CreateSlaughterEventDto {
  @IsUUID() animalId!: string;
  @IsString() slaughteredAt!: string;
  @IsNumber() @Min(0) liveWeightKg!: number;
  @IsOptional() @IsNumber() carcassWeightKg?: number;
  @IsOptional() @IsString() destination?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsBoolean() override?: boolean;
  @IsOptional() @IsString() overrideReason?: string;
}

export interface SlaughterEligibilityInputs {
  animalDob?: Date | null;
  animalStage?: string | null;
  latestWeightKg?: number | null;
  latestWeightRecordedAt?: Date | null;
  activeWithdrawalUntil?: Date | null;
  rule: {
    minWeightKg: number;
    maxWeightKg: number;
    minAgeDays?: number | null;
    requireRecentWeightDays?: number | null;
    blockIfWithdrawal: boolean;
  };
  now: Date;
}

export interface SlaughterEligibilityResult {
  eligible: boolean;
  reasons: string[];
}

export function evaluateSlaughterEligibility(input: SlaughterEligibilityInputs): SlaughterEligibilityResult {
  const reasons: string[] = [];
  const { latestWeightKg, latestWeightRecordedAt, activeWithdrawalUntil, rule, animalDob } = input;
  if (latestWeightKg == null) {
    reasons.push("Missing weight record");
  } else {
    if (latestWeightKg < rule.minWeightKg) reasons.push("Below minimum weight");
    if (latestWeightKg > rule.maxWeightKg) reasons.push("Above maximum weight");
  }
  if (rule.requireRecentWeightDays != null) {
    if (!latestWeightRecordedAt) {
      reasons.push("Missing recent weight record");
    } else {
      const maxAgeMs = rule.requireRecentWeightDays * 86400000;
      if (input.now.getTime() - latestWeightRecordedAt.getTime() > maxAgeMs) {
        reasons.push("Weight record too old");
      }
    }
  }
  if (rule.minAgeDays != null && animalDob) {
    const ageDays = Math.floor((input.now.getTime() - animalDob.getTime()) / 86400000);
    if (ageDays < rule.minAgeDays) reasons.push("Below minimum age");
  } else if (rule.minAgeDays != null && !animalDob) {
    reasons.push("Unknown age");
  }
  if (rule.blockIfWithdrawal && activeWithdrawalUntil && activeWithdrawalUntil > input.now) {
    reasons.push("Active withdrawal period");
  }
  return { eligible: reasons.length === 0, reasons };
}

@ApiTags("Slaughter")
@Controller()
class SlaughterController {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  private async getEffectiveRule(farmId: string, animalStage?: string | null) {
    return this.prisma.slaughterRule.findFirst({
      where: {
        farmId,
        deletedAt: null,
        livestockType: "PIG",
        OR: [{ stage: animalStage ?? undefined }, { stage: null }],
      },
      orderBy: [{ stage: "desc" }, { createdAt: "desc" }],
    });
  }

  @Get("slaughter/eligibility")
  @Authz({ farm: true, permissions: [PERMISSIONS.SLAUGHTER_VIEW] })
  async eligibility(@CurrentUser() user: any, @Query("animalId") animalId?: string) {
    const farmId = user.activeFarmId;
    if (animalId) return this.getAnimalEligibility(farmId, animalId);
    const animals = await this.prisma.animal.findMany({
      where: { farmId, deletedAt: null, type: "PIG", status: "ACTIVE" },
      take: 100,
    });
    const results = await Promise.all(animals.map((a) => this.getAnimalEligibility(farmId, a.id)));
    return results;
  }

  private async getAnimalEligibility(farmId: string, animalId: string) {
    const animal = await this.prisma.animal.findFirst({ where: { id: animalId, farmId } });
    if (!animal) return null;
    const [latestWeight, lastTreatment, rule] = await Promise.all([
      this.prisma.weightRecord.findFirst({
        where: { farmId, animalId, deletedAt: null },
        orderBy: { recordedAt: "desc" },
      }),
      this.prisma.treatmentEvent.findFirst({
        where: { farmId, animalId, deletedAt: null },
        orderBy: { withdrawalEndAt: "desc" },
      }),
      this.getEffectiveRule(farmId, animal.stage),
    ]);
    if (!rule) {
      return { animalId, eligible: false, reasons: ["No slaughter rule configured"] };
    }
    const result = evaluateSlaughterEligibility({
      animalDob: animal.dob,
      animalStage: animal.stage,
      latestWeightKg: latestWeight?.weightKg,
      latestWeightRecordedAt: latestWeight?.recordedAt,
      activeWithdrawalUntil: lastTreatment?.withdrawalEndAt ?? null,
      rule: {
        minWeightKg: rule.minWeightKg,
        maxWeightKg: rule.maxWeightKg,
        minAgeDays: rule.minAgeDays,
        requireRecentWeightDays: rule.requireRecentWeightDays,
        blockIfWithdrawal: rule.blockIfWithdrawal,
      },
      now: new Date(),
    });
    return { animalId, animalTag: animal.tag, ...result, latestWeight, rule };
  }

  @Post("slaughter-events")
  @Authz({ farm: true, permissions: [PERMISSIONS.SLAUGHTER_EDIT] })
  async createSlaughterEvent(@Body() dto: CreateSlaughterEventDto, @CurrentUser() user: any) {
    const farmId = user.activeFarmId;
    const status = await this.getAnimalEligibility(farmId, dto.animalId);
    if (!status) throw new BadRequestException("Animal not found");
    let overrideEvent: any = null;

    if (!status.eligible) {
      if (!dto.override) {
        throw new BadRequestException({ message: "Animal is not eligible for slaughter", reasons: status.reasons });
      }
      if (!dto.overrideReason?.trim()) {
        throw new BadRequestException("Override reason is required");
      }
      const rule = status.rule;
      const allowedRoleIds: string[] = ((rule?.overrideRoleIdsJson as string[] | null) ?? []);
      if (!allowedRoleIds.includes(user.membershipRoleId)) {
        throw new ForbiddenException("Current role cannot override slaughter eligibility");
      }
      overrideEvent = await this.prisma.overrideEvent.create({
        data: {
          farmId,
          entityType: "SlaughterEvent",
          entityId: dto.animalId,
          reason: dto.overrideReason,
          overriddenById: user.userId,
        },
      });
      await this.audit.logWrite({
        farmId,
        actorUserId: user.userId,
        entityType: "OverrideEvent",
        entityId: overrideEvent.id,
        action: AuditAction.OVERRIDE,
        afterJson: overrideEvent,
      });
    }

    const created = await this.prisma.slaughterEvent.create({
      data: {
        farmId,
        animalId: dto.animalId,
        slaughteredAt: new Date(dto.slaughteredAt),
        liveWeightKg: dto.liveWeightKg,
        carcassWeightKg: dto.carcassWeightKg,
        destination: dto.destination,
        notes: dto.notes,
      },
    });
    await this.prisma.animal.update({
      where: { id: dto.animalId },
      data: { status: "SLAUGHTERED", version: { increment: 1 } },
    });
    await this.audit.logWrite({
      farmId,
      actorUserId: user.userId,
      entityType: "SlaughterEvent",
      entityId: created.id,
      action: AuditAction.CREATE,
      afterJson: created,
    });
    return { event: created, overrideEvent };
  }

  @Get("farms/:farmId/slaughter-rules")
  @Authz({ farm: true, permissions: [PERMISSIONS.SLAUGHTER_VIEW] })
  listRules(@Param("farmId") farmId: string) {
    return this.prisma.slaughterRule.findMany({ where: { farmId, deletedAt: null } });
  }
  @Post("farms/:farmId/slaughter-rules")
  @Authz({ farm: true, permissions: [PERMISSIONS.SLAUGHTER_EDIT] })
  createRule(@Param("farmId") farmId: string, @Body() dto: SlaughterRuleDto) {
    return this.prisma.slaughterRule.create({
      data: {
        farmId,
        livestockType: dto.livestockType ?? "PIG",
        stage: dto.stage,
        minWeightKg: dto.minWeightKg,
        maxWeightKg: dto.maxWeightKg,
        minAgeDays: dto.minAgeDays,
        requireRecentWeightDays: dto.requireRecentWeightDays,
        blockIfWithdrawal: dto.blockIfWithdrawal ?? true,
        overrideRoleIdsJson: (dto.overrideRoleIds ?? []) as any,
      },
    });
  }
  @Patch("slaughter-rules/:id")
  @Authz({ farm: true, permissions: [PERMISSIONS.SLAUGHTER_EDIT] })
  async patchRule(@Param("id") id: string, @Body() dto: Partial<SlaughterRuleDto>, @CurrentUser() user: any) {
    const existing = await this.prisma.slaughterRule.findFirst({ where: { id, farmId: user.activeFarmId } });
    if (!existing) return null;
    return this.prisma.slaughterRule.update({
      where: { id },
      data: { ...dto, overrideRoleIdsJson: dto.overrideRoleIds as any, version: { increment: 1 } } as any,
    });
  }
  @Delete("slaughter-rules/:id")
  @Authz({ farm: true, permissions: [PERMISSIONS.SLAUGHTER_EDIT] })
  async deleteRule(@Param("id") id: string, @CurrentUser() user: any) {
    const existing = await this.prisma.slaughterRule.findFirst({ where: { id, farmId: user.activeFarmId } });
    if (!existing) return null;
    return this.prisma.slaughterRule.update({ where: { id }, data: { deletedAt: new Date(), version: { increment: 1 } } });
  }
}

@Module({ controllers: [SlaughterController] })
export class SlaughterModule {}
