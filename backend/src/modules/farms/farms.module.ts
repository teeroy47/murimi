import { Body, Controller, Get, Module, Param, Patch, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { PrismaService } from "src/prisma/prisma.service";
import { Authz } from "src/common/decorators/authz.decorator";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { AuditService } from "../audit/audit.service";
import { AuditAction } from "@prisma/client";

class CreateFarmDto {
  @IsString()
  name!: string;
}

class PatchThemeDto {
  @IsOptional() @IsString() logoUrl?: string;
  @IsOptional() @IsString() primaryColor?: string;
  @IsOptional() @IsString() secondaryColor?: string;
  @IsOptional() @IsString() fontFamily?: string;
}

@ApiTags("Farms")
@Controller("farms")
class FarmsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  @Get()
  @Authz()
  async list(@CurrentUser() user: any) {
    return this.prisma.membership.findMany({
      where: { userId: user.userId, status: "ACTIVE" },
      include: { farm: { include: { theme: true } }, role: true },
    });
  }

  @Post()
  @Authz()
  async create(@Body() dto: CreateFarmDto, @CurrentUser() user: any) {
    const adminRole = await this.prisma.role.findFirst({
      where: { farmId: "SYSTEM_TEMPLATE", name: "Admin" },
      include: { rolePermissions: true },
    });
    const created = await this.prisma.$transaction(async (tx) => {
      const farm = await tx.farm.create({
        data: { name: dto.name, createdById: user.userId },
      });
      const role = await tx.role.create({
        data: {
          farmId: farm.id,
          name: "Admin",
          description: "Farm administrator",
          isSystem: true,
        },
      });
      const perms = await tx.permission.findMany();
      if (perms.length) {
        await tx.rolePermission.createMany({
          data: perms.map((p) => ({ roleId: role.id, permissionId: p.id })),
          skipDuplicates: true,
        });
      }
      await tx.membership.create({
        data: { farmId: farm.id, userId: user.userId, roleId: role.id, status: "ACTIVE" },
      });
      return farm;
    });
    await this.audit.logWrite({
      farmId: created.id,
      actorUserId: user.userId,
      entityType: "Farm",
      entityId: created.id,
      action: AuditAction.CREATE,
      afterJson: created,
    });
    return created;
  }

  @Patch(":farmId/theme")
  @Authz({ farm: true })
  async patchTheme(
    @Param("farmId") farmId: string,
    @Body() dto: PatchThemeDto,
    @CurrentUser() user: any,
  ) {
    const before = await this.prisma.farmTheme.findUnique({ where: { farmId } });
    const updated = await this.prisma.farmTheme.upsert({
      where: { farmId },
      create: { farmId, ...dto },
      update: dto,
    });
    await this.audit.logWrite({
      farmId,
      actorUserId: user.userId,
      entityType: "FarmTheme",
      entityId: updated.id,
      action: before ? AuditAction.UPDATE : AuditAction.CREATE,
      beforeJson: before ?? undefined,
      afterJson: updated,
    });
    return updated;
  }
}

@Module({
  controllers: [FarmsController],
})
export class FarmsModule {}
