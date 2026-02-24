import {
  Body,
  Controller,
  Get,
  Module,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString, IsUUID } from "class-validator";
import { AnimalSex, AnimalStage, AnimalStatus, AnimalType, AuditAction } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { Authz } from "src/common/decorators/authz.decorator";
import { PERMISSIONS } from "src/common/constants/permissions";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { AuditService } from "../audit/audit.service";
import { recordChangeCursor } from "src/common/utils/change-cursor";
import { toPagination } from "src/common/utils/pagination";

class CreateAnimalDto {
  @IsOptional() @IsEnum(AnimalType) type?: AnimalType;
  @IsString() tag!: string;
  @IsOptional() @IsEnum(AnimalSex) sex?: AnimalSex;
  @IsOptional() @IsString() dob?: string;
  @IsEnum(AnimalStage) stage!: AnimalStage;
  @IsOptional() @IsEnum(AnimalStatus) status?: AnimalStatus;
  @IsOptional() @IsUUID() currentPenId?: string;
  @IsOptional() @IsString() notes?: string;
}

class PatchAnimalDto {
  @IsOptional() @IsEnum(AnimalStage) stage?: AnimalStage;
  @IsOptional() @IsEnum(AnimalStatus) status?: AnimalStatus;
  @IsOptional() @IsUUID() currentPenId?: string;
  @IsOptional() @IsString() notes?: string;
}

class MovePenDto {
  @IsUUID() penId!: string;
}

class AnimalListQueryDto {
  @IsOptional() @IsString() tag?: string;
  @IsOptional() @IsString() stage?: string;
  @IsOptional() page?: number;
  @IsOptional() pageSize?: number;
}

@ApiTags("Animals/Pigs")
@Controller()
class AnimalsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  @Get("farms/:farmId/animals")
  @Authz({ farm: true, permissions: [PERMISSIONS.ANIMALS_VIEW] })
  async list(@Param("farmId") farmId: string, @Query() q: AnimalListQueryDto) {
    const { page, pageSize, skip, take } = toPagination(q);
    const where = {
      farmId,
      deletedAt: null,
      tag: q.tag ? { contains: q.tag, mode: "insensitive" as const } : undefined,
      stage: q.stage as AnimalStage | undefined,
    };
    const [items, total] = await Promise.all([
      this.prisma.animal.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
      this.prisma.animal.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  @Post("farms/:farmId/animals")
  @Authz({ farm: true, permissions: [PERMISSIONS.ANIMALS_EDIT] })
  async create(
    @Param("farmId") farmId: string,
    @Body() dto: CreateAnimalDto,
    @CurrentUser() user: any,
  ) {
    const created = await this.prisma.animal.create({
      data: {
        farmId,
        type: dto.type ?? AnimalType.PIG,
        tag: dto.tag,
        sex: dto.sex ?? AnimalSex.UNKNOWN,
        stage: dto.stage,
        status: dto.status ?? AnimalStatus.ACTIVE,
        currentPenId: dto.currentPenId,
        notes: dto.notes,
        dob: dto.dob ? new Date(dto.dob) : undefined,
      },
    });
    await recordChangeCursor(this.prisma, {
      farmId,
      entityType: "Animal",
      entityId: created.id,
      version: created.version,
    });
    await this.audit.logWrite({
      farmId,
      actorUserId: user.userId,
      entityType: "Animal",
      entityId: created.id,
      action: AuditAction.CREATE,
      afterJson: created,
    });
    return created;
  }

  @Get("animals/:id")
  @Authz({ farm: true, permissions: [PERMISSIONS.ANIMALS_VIEW] })
  async get(@Param("id") id: string, @CurrentUser() user: any) {
    return this.prisma.animal.findFirst({
      where: { id, farmId: user.activeFarmId, deletedAt: null },
      include: { currentPen: true, weightRecords: { orderBy: { recordedAt: "desc" }, take: 10 } },
    });
  }

  @Patch("animals/:id")
  @Authz({ farm: true, permissions: [PERMISSIONS.ANIMALS_EDIT] })
  async patch(
    @Param("id") id: string,
    @Body() dto: PatchAnimalDto,
    @CurrentUser() user: any,
  ) {
    const before = await this.prisma.animal.findFirst({ where: { id, farmId: user.activeFarmId } });
    if (!before) return null;
    const updated = await this.prisma.animal.update({
      where: { id },
      data: {
        ...dto,
        version: { increment: 1 },
      },
    });
    await recordChangeCursor(this.prisma, {
      farmId: user.activeFarmId,
      entityType: "Animal",
      entityId: id,
      version: updated.version,
      deletedAt: updated.deletedAt,
    });
    await this.audit.logWrite({
      farmId: user.activeFarmId,
      actorUserId: user.userId,
      entityType: "Animal",
      entityId: id,
      action: AuditAction.UPDATE,
      beforeJson: before,
      afterJson: updated,
    });
    return updated;
  }

  @Post("animals/:id/move-pen")
  @Authz({ farm: true, permissions: [PERMISSIONS.ANIMALS_EDIT] })
  async movePen(
    @Param("id") id: string,
    @Body() dto: MovePenDto,
    @CurrentUser() user: any,
  ) {
    return this.patch(id, { currentPenId: dto.penId } as PatchAnimalDto, user);
  }
}

@Module({
  imports: [],
  controllers: [AnimalsController],
})
export class AnimalsModule {}
