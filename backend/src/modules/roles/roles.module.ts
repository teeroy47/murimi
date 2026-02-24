import {
  Body,
  Controller,
  Get,
  Module,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { ApiTags } from "@nestjs/swagger";
import { IsArray, IsOptional, IsString } from "class-validator";
import { Authz } from "src/common/decorators/authz.decorator";
import { PERMISSIONS } from "src/common/constants/permissions";
import { AuditService } from "../audit/audit.service";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { AuditAction } from "@prisma/client";

class CreateRoleDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  permissionCodes!: string[];
}

class PatchRoleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  permissionCodes?: string[];
}

@ApiTags("RBAC")
@Controller("farms/:farmId/roles")
class RolesController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  @Get()
  @Authz({ farm: true, permissions: [PERMISSIONS.ROLES_MANAGE] })
  async list(@Param("farmId") farmId: string) {
    return this.prisma.role.findMany({
      where: { farmId },
      include: { rolePermissions: { include: { permission: true } } },
      orderBy: { name: "asc" },
    });
  }

  @Post()
  @Authz({ farm: true, permissions: [PERMISSIONS.ROLES_MANAGE] })
  async create(
    @Param("farmId") farmId: string,
    @Body() dto: CreateRoleDto,
    @CurrentUser() user: any,
  ) {
    const perms = await this.prisma.permission.findMany({
      where: { code: { in: dto.permissionCodes } },
    });
    const created = await this.prisma.role.create({
      data: {
        farmId,
        name: dto.name,
        description: dto.description,
        rolePermissions: {
          create: perms.map((p) => ({ permissionId: p.id })),
        },
      },
      include: { rolePermissions: { include: { permission: true } } },
    });
    await this.audit.logWrite({
      farmId,
      actorUserId: user.userId,
      entityType: "Role",
      entityId: created.id,
      action: AuditAction.CREATE,
      afterJson: created,
    });
    return created;
  }

  @Patch(":roleId")
  @Authz({ farm: true, permissions: [PERMISSIONS.ROLES_MANAGE] })
  async patch(
    @Param("farmId") farmId: string,
    @Param("roleId") roleId: string,
    @Body() dto: PatchRoleDto,
    @CurrentUser() user: any,
  ) {
    const before = await this.prisma.role.findFirst({
      where: { id: roleId, farmId },
      include: { rolePermissions: true },
    });
    if (!before) return null;

    if (dto.permissionCodes) {
      const perms = await this.prisma.permission.findMany({
        where: { code: { in: dto.permissionCodes } },
      });
      await this.prisma.rolePermission.deleteMany({ where: { roleId } });
      await this.prisma.rolePermission.createMany({
        data: perms.map((p) => ({ roleId, permissionId: p.id })),
        skipDuplicates: true,
      });
    }

    const updated = await this.prisma.role.update({
      where: { id: roleId },
      data: { name: dto.name, description: dto.description },
      include: { rolePermissions: { include: { permission: true } } },
    });
    await this.audit.logWrite({
      farmId,
      actorUserId: user.userId,
      entityType: "Role",
      entityId: roleId,
      action: AuditAction.UPDATE,
      beforeJson: before,
      afterJson: updated,
    });
    return updated;
  }
}

@Module({
  controllers: [RolesController],
})
export class RolesModule {}
