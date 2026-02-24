import { Body, Controller, Delete, Get, Module, Param, Patch, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsInt, IsOptional, IsString, IsUUID, Min } from "class-validator";
import { AuditAction, ScheduleTemplateType } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { Authz } from "src/common/decorators/authz.decorator";
import { PERMISSIONS } from "src/common/constants/permissions";
import { AuditService } from "../audit/audit.service";
import { CurrentUser } from "src/common/decorators/current-user.decorator";

class MedicineDto {
  @IsString() name!: string;
  @IsOptional() @IsInt() defaultWithdrawalDays?: number;
  @IsOptional() @IsString() notes?: string;
}
class ScheduleTemplateDto {
  @IsString() type!: ScheduleTemplateType;
  @IsOptional() @IsString() stage?: string;
  @IsOptional() @IsInt() ageDays?: number;
  @IsOptional() @IsUUID() medicineId?: string;
  @IsOptional() @IsString() notes?: string;
}
class KBArticleDto {
  @IsString() title!: string;
  @IsString() body!: string;
  @IsOptional() @IsArray() tagsJson?: string[];
}
class SymptomEventDto {
  @IsOptional() @IsUUID() animalId?: string;
  @IsOptional() @IsUUID() penId?: string;
  @IsArray() symptomsJson!: string[];
  @IsString() observedAt!: string;
  @IsOptional() @IsString() notes?: string;
}
class TreatmentEventDto {
  @IsOptional() @IsUUID() animalId?: string;
  @IsOptional() @IsUUID() batchId?: string;
  @IsUUID() medicineId!: string;
  @IsString() dose!: string;
  @IsString() administeredAt!: string;
  @IsOptional() @IsInt() manualWithdrawalDays?: number;
  @IsOptional() @IsString() notes?: string;
}
class DiagnosisSuggestDto {
  @IsOptional() @IsString() stage?: string;
  @IsOptional() @IsInt() ageDays?: number;
  @IsArray() symptoms!: string[];
}

export function computeWithdrawalEnd(administeredAt: Date, days?: number | null) {
  if (days == null) return null;
  return new Date(administeredAt.getTime() + days * 24 * 60 * 60 * 1000);
}

@ApiTags("Health")
@Controller()
class HealthController {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  @Get("farms/:farmId/medicines")
  @Authz({ farm: true, permissions: [PERMISSIONS.HEALTH_VIEW] })
  listMedicines(@Param("farmId") farmId: string) {
    return this.prisma.medicine.findMany({ where: { farmId, deletedAt: null } });
  }
  @Post("farms/:farmId/medicines")
  @Authz({ farm: true, permissions: [PERMISSIONS.HEALTH_EDIT] })
  createMedicine(@Param("farmId") farmId: string, @Body() dto: MedicineDto) {
    return this.prisma.medicine.create({ data: { farmId, ...dto } });
  }
  @Patch("medicines/:id")
  @Authz({ farm: true, permissions: [PERMISSIONS.HEALTH_EDIT] })
  async patchMedicine(@Param("id") id: string, @Body() dto: Partial<MedicineDto>, @CurrentUser() user: any) {
    const existing = await this.prisma.medicine.findFirst({ where: { id, farmId: user.activeFarmId } });
    if (!existing) return null;
    return this.prisma.medicine.update({ where: { id }, data: { ...dto, version: { increment: 1 } } });
  }
  @Delete("medicines/:id")
  @Authz({ farm: true, permissions: [PERMISSIONS.HEALTH_EDIT] })
  async deleteMedicine(@Param("id") id: string, @CurrentUser() user: any) {
    const existing = await this.prisma.medicine.findFirst({ where: { id, farmId: user.activeFarmId } });
    if (!existing) return null;
    return this.prisma.medicine.update({ where: { id }, data: { deletedAt: new Date(), version: { increment: 1 } } });
  }

  @Get("farms/:farmId/schedule-templates")
  @Authz({ farm: true, permissions: [PERMISSIONS.HEALTH_VIEW] })
  listScheduleTemplates(@Param("farmId") farmId: string) {
    return this.prisma.scheduleTemplate.findMany({ where: { farmId, deletedAt: null } });
  }
  @Post("farms/:farmId/schedule-templates")
  @Authz({ farm: true, permissions: [PERMISSIONS.HEALTH_EDIT] })
  createScheduleTemplate(@Param("farmId") farmId: string, @Body() dto: ScheduleTemplateDto) {
    return this.prisma.scheduleTemplate.create({ data: { farmId, ...(dto as any) } });
  }
  @Patch("schedule-templates/:id")
  @Authz({ farm: true, permissions: [PERMISSIONS.HEALTH_EDIT] })
  async patchScheduleTemplate(@Param("id") id: string, @Body() dto: Partial<ScheduleTemplateDto>, @CurrentUser() user: any) {
    const existing = await this.prisma.scheduleTemplate.findFirst({ where: { id, farmId: user.activeFarmId } });
    if (!existing) return null;
    return this.prisma.scheduleTemplate.update({ where: { id }, data: { ...(dto as any), version: { increment: 1 } } });
  }
  @Delete("schedule-templates/:id")
  @Authz({ farm: true, permissions: [PERMISSIONS.HEALTH_EDIT] })
  async deleteScheduleTemplate(@Param("id") id: string, @CurrentUser() user: any) {
    const existing = await this.prisma.scheduleTemplate.findFirst({ where: { id, farmId: user.activeFarmId } });
    if (!existing) return null;
    return this.prisma.scheduleTemplate.update({ where: { id }, data: { deletedAt: new Date(), version: { increment: 1 } } });
  }

  @Get("farms/:farmId/kb-articles")
  @Authz({ farm: true, permissions: [PERMISSIONS.HEALTH_VIEW] })
  listKb(@Param("farmId") farmId: string) {
    return this.prisma.kBArticle.findMany({ where: { farmId, deletedAt: null } });
  }
  @Post("farms/:farmId/kb-articles")
  @Authz({ farm: true, permissions: [PERMISSIONS.KB_MANAGE] })
  createKb(@Param("farmId") farmId: string, @Body() dto: KBArticleDto) {
    return this.prisma.kBArticle.create({ data: { farmId, title: dto.title, body: dto.body, tagsJson: dto.tagsJson as any } });
  }
  @Patch("kb-articles/:id")
  @Authz({ farm: true, permissions: [PERMISSIONS.KB_MANAGE] })
  async patchKb(@Param("id") id: string, @Body() dto: Partial<KBArticleDto>, @CurrentUser() user: any) {
    const existing = await this.prisma.kBArticle.findFirst({ where: { id, farmId: user.activeFarmId } });
    if (!existing) return null;
    return this.prisma.kBArticle.update({ where: { id }, data: { ...(dto as any), version: { increment: 1 } } });
  }
  @Delete("kb-articles/:id")
  @Authz({ farm: true, permissions: [PERMISSIONS.KB_MANAGE] })
  async deleteKb(@Param("id") id: string, @CurrentUser() user: any) {
    const existing = await this.prisma.kBArticle.findFirst({ where: { id, farmId: user.activeFarmId } });
    if (!existing) return null;
    return this.prisma.kBArticle.update({ where: { id }, data: { deletedAt: new Date(), version: { increment: 1 } } });
  }

  @Post("farms/:farmId/symptom-events")
  @Authz({ farm: true, permissions: [PERMISSIONS.HEALTH_EDIT] })
  async createSymptomEvent(@Param("farmId") farmId: string, @Body() dto: SymptomEventDto, @CurrentUser() user: any) {
    const created = await this.prisma.symptomEvent.create({ data: { farmId, ...dto, observedAt: new Date(dto.observedAt), symptomsJson: dto.symptomsJson as any } as any });
    await this.audit.logWrite({ farmId, actorUserId: user.userId, entityType: "SymptomEvent", entityId: created.id, action: AuditAction.CREATE, afterJson: created });
    return created;
  }

  @Post("farms/:farmId/treatment-events")
  @Authz({ farm: true, permissions: [PERMISSIONS.HEALTH_EDIT] })
  async createTreatmentEvent(@Param("farmId") farmId: string, @Body() dto: TreatmentEventDto, @CurrentUser() user: any) {
    const medicine = await this.prisma.medicine.findFirst({ where: { id: dto.medicineId, farmId } });
    const administeredAt = new Date(dto.administeredAt);
    const withdrawalDays = dto.manualWithdrawalDays ?? medicine?.defaultWithdrawalDays ?? null;
    const withdrawalEndAt = computeWithdrawalEnd(administeredAt, withdrawalDays);
    const created = await this.prisma.treatmentEvent.create({
      data: {
        farmId,
        animalId: dto.animalId,
        batchId: dto.batchId,
        medicineId: dto.medicineId,
        dose: dto.dose,
        administeredAt,
        withdrawalEndAt,
        notes: dto.notes,
      },
    });
    await this.audit.logWrite({ farmId, actorUserId: user.userId, entityType: "TreatmentEvent", entityId: created.id, action: AuditAction.CREATE, afterJson: created });
    return created;
  }

  @Post("diagnosis/suggest")
  @Authz({ farm: true, permissions: [PERMISSIONS.HEALTH_VIEW] })
  async suggest(@Body() dto: DiagnosisSuggestDto, @CurrentUser() user: any) {
    const rules = await this.prisma.diagnosisRule.findMany({ where: { farmId: user.activeFarmId, deletedAt: null } });
    const symptomSet = new Set(dto.symptoms.map((s) => s.toLowerCase()));
    const matches = rules.filter((rule) => {
      const ruleSymptoms = (rule.symptomsJson as string[] | null) ?? [];
      const symptomMatch = ruleSymptoms.every((s) => symptomSet.has(String(s).toLowerCase()));
      const stageMatch = !rule.stageConstraint || !dto.stage || rule.stageConstraint === dto.stage;
      const minAgeMatch = rule.minAgeDays == null || dto.ageDays == null || dto.ageDays >= rule.minAgeDays;
      const maxAgeMatch = rule.maxAgeDays == null || dto.ageDays == null || dto.ageDays <= rule.maxAgeDays;
      return symptomMatch && stageMatch && minAgeMatch && maxAgeMatch;
    });
    return {
      suggestions: matches.map((m) => ({
        ruleId: m.id,
        suggestedActions: m.suggestedActionsJson,
        suggestedMedicines: m.suggestedMedicinesJson,
      })),
      disclaimer: "Rules-based suggestions only; consult a veterinarian.",
    };
  }
}

@Module({ controllers: [HealthController] })
export class HealthModule {}
