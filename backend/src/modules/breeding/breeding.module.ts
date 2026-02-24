import { Body, Controller, Get, Module, Param, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { IsArray, IsInt, IsOptional, IsString, IsUUID, Min } from "class-validator";
import { AuditAction } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { Authz } from "src/common/decorators/authz.decorator";
import { PERMISSIONS } from "src/common/constants/permissions";
import { AuditService } from "../audit/audit.service";
import { CurrentUser } from "src/common/decorators/current-user.decorator";

class HeatEventDto {
  @IsUUID() sowAnimalId!: string;
  @IsString() observedAt!: string;
  @IsOptional() @IsArray() signsJson?: string[];
}
class ServiceEventDto {
  @IsUUID() sowAnimalId!: string;
  @IsOptional() @IsUUID() boarAnimalId?: string;
  @IsString() servicedAt!: string;
  @IsOptional() @IsString() notes?: string;
}
class FarrowingEventDto {
  @IsUUID() sowAnimalId!: string;
  @IsString() farrowedAt!: string;
  @IsInt() @Min(0) bornAlive!: number;
  @IsInt() @Min(0) stillborn!: number;
  @IsOptional() @IsString() notes?: string;
}

export function computeExpectedFarrowDate(servicedAt: Date, gestationDays = 114) {
  return new Date(servicedAt.getTime() + gestationDays * 24 * 60 * 60 * 1000);
}

@ApiTags("Breeding")
@Controller()
class BreedingController {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  @Post("farms/:farmId/heat-events")
  @Authz({ farm: true, permissions: [PERMISSIONS.BREEDING_EDIT] })
  async createHeat(@Param("farmId") farmId: string, @Body() dto: HeatEventDto, @CurrentUser() user: any) {
    const created = await this.prisma.heatEvent.create({
      data: { farmId, sowAnimalId: dto.sowAnimalId, observedAt: new Date(dto.observedAt), signsJson: dto.signsJson as any },
    });
    await this.audit.logWrite({ farmId, actorUserId: user.userId, entityType: "HeatEvent", entityId: created.id, action: AuditAction.CREATE, afterJson: created });
    return created;
  }

  @Post("farms/:farmId/service-events")
  @Authz({ farm: true, permissions: [PERMISSIONS.BREEDING_EDIT] })
  async createService(@Param("farmId") farmId: string, @Body() dto: ServiceEventDto, @CurrentUser() user: any) {
    const servicedAt = new Date(dto.servicedAt);
    const expectedFarrowAt = computeExpectedFarrowDate(servicedAt, Number(process.env.DEFAULT_GESTATION_DAYS ?? 114));
    const created = await this.prisma.serviceEvent.create({
      data: { farmId, sowAnimalId: dto.sowAnimalId, boarAnimalId: dto.boarAnimalId, servicedAt, expectedFarrowAt, notes: dto.notes },
    });
    await this.audit.logWrite({ farmId, actorUserId: user.userId, entityType: "ServiceEvent", entityId: created.id, action: AuditAction.CREATE, afterJson: created });
    return created;
  }

  @Post("farms/:farmId/farrowing-events")
  @Authz({ farm: true, permissions: [PERMISSIONS.BREEDING_EDIT] })
  async createFarrowing(@Param("farmId") farmId: string, @Body() dto: FarrowingEventDto, @CurrentUser() user: any) {
    const created = await this.prisma.farrowingEvent.create({
      data: { farmId, sowAnimalId: dto.sowAnimalId, farrowedAt: new Date(dto.farrowedAt), bornAlive: dto.bornAlive, stillborn: dto.stillborn, notes: dto.notes },
    });
    await this.audit.logWrite({ farmId, actorUserId: user.userId, entityType: "FarrowingEvent", entityId: created.id, action: AuditAction.CREATE, afterJson: created });
    return created;
  }

  @Get("breeding/calendar")
  @Authz({ farm: true, permissions: [PERMISSIONS.BREEDING_VIEW] })
  async calendar(@CurrentUser() user: any, @Query("from") from?: string, @Query("to") to?: string) {
    const farmId = user.activeFarmId;
    const range = {
      gte: from ? new Date(from) : undefined,
      lte: to ? new Date(to) : undefined,
    };
    const [heats, services, farrowings] = await Promise.all([
      this.prisma.heatEvent.findMany({ where: { farmId, observedAt: range, deletedAt: null } }),
      this.prisma.serviceEvent.findMany({ where: { farmId, servicedAt: range, deletedAt: null } }),
      this.prisma.farrowingEvent.findMany({ where: { farmId, farrowedAt: range, deletedAt: null } }),
    ]);
    return { heats, services, farrowings };
  }
}

@Module({ controllers: [BreedingController] })
export class BreedingModule {}
