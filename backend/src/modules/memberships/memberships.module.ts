import {
  Body,
  Controller,
  Get,
  Module,
  Param,
  Post,
  UnauthorizedException,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString } from "class-validator";
import { createHash, randomBytes } from "crypto";
import { PrismaService } from "src/prisma/prisma.service";
import { Authz } from "src/common/decorators/authz.decorator";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { AuditService } from "../audit/audit.service";
import { AuditAction } from "@prisma/client";
import { PERMISSIONS } from "src/common/constants/permissions";

class InviteMemberDto {
  @IsEmail()
  email!: string;

  @IsString()
  roleId!: string;

  @IsOptional()
  @IsString()
  expiresInDays?: string;
}

class AcceptInviteDto {
  @IsString()
  token!: string;
}

function sha256(input: string) {
  return createHash("sha256").update(input).digest("hex");
}

@ApiTags("Invites/Memberships")
@Controller()
class MembershipsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  @Post("farms/:farmId/invites")
  @Authz({ farm: true, permissions: [PERMISSIONS.SETTINGS_MANAGE_USERS] })
  async invite(
    @Param("farmId") farmId: string,
    @Body() dto: InviteMemberDto,
    @CurrentUser() user: any,
  ) {
    const rawToken = randomBytes(24).toString("hex");
    const invite = await this.prisma.farmInvite.create({
      data: {
        farmId,
        email: dto.email.toLowerCase(),
        roleId: dto.roleId,
        tokenHash: sha256(rawToken),
        invitedById: user.userId,
        expiresAt: new Date(Date.now() + (Number(dto.expiresInDays ?? 7) * 86400000)),
      },
    });
    await this.audit.logWrite({
      farmId,
      actorUserId: user.userId,
      entityType: "FarmInvite",
      entityId: invite.id,
      action: AuditAction.CREATE,
      afterJson: { ...invite, tokenHash: undefined },
    });
    return { inviteId: invite.id, token: rawToken, expiresAt: invite.expiresAt };
  }

  @Post("invites/accept")
  @Authz()
  async accept(@Body() dto: AcceptInviteDto, @CurrentUser() user: any) {
    const invite = await this.prisma.farmInvite.findFirst({
      where: { tokenHash: sha256(dto.token), status: "PENDING" },
      include: { role: true },
    });
    if (!invite || invite.expiresAt < new Date()) {
      throw new UnauthorizedException("Invalid or expired invite");
    }
    const membership = await this.prisma.membership.upsert({
      where: { userId_farmId: { userId: user.userId, farmId: invite.farmId } },
      create: {
        userId: user.userId,
        farmId: invite.farmId,
        roleId: invite.roleId,
        status: "ACTIVE",
      },
      update: { roleId: invite.roleId, status: "ACTIVE" },
    });
    await this.prisma.farmInvite.update({
      where: { id: invite.id },
      data: { status: "ACCEPTED", acceptedAt: new Date() },
    });
    await this.audit.logWrite({
      farmId: invite.farmId,
      actorUserId: user.userId,
      entityType: "Membership",
      entityId: membership.id,
      action: AuditAction.CREATE,
      afterJson: membership,
    });
    return membership;
  }

  @Get("farms/:farmId/members")
  @Authz({ farm: true, permissions: [PERMISSIONS.SETTINGS_MANAGE_USERS] })
  async listMembers(@Param("farmId") farmId: string) {
    return this.prisma.membership.findMany({
      where: { farmId },
      include: { user: true, role: true },
      orderBy: { createdAt: "desc" },
    });
  }
}

@Module({
  controllers: [MembershipsController],
})
export class MembershipsModule {}
