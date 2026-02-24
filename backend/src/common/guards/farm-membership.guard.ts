import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class FarmMembershipGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const farmId = (req.params.farmId as string | undefined) ?? (req.headers["x-farm-id"] as string | undefined);
    if (!farmId) {
      throw new ForbiddenException("Farm context is required (x-farm-id or route param)");
    }
    const userId: string | undefined = req.user?.userId;
    if (!userId) {
      throw new ForbiddenException("User context missing");
    }
    const membership = await this.prisma.membership.findFirst({
      where: { farmId, userId, status: "ACTIVE" },
      include: {
        role: {
          include: { rolePermissions: { include: { permission: true } } },
        },
      },
    });
    if (!membership) {
      throw new ForbiddenException("User is not a member of this farm");
    }
    req.user.activeFarmId = farmId;
    req.user.membershipRoleId = membership.roleId;
    req.user.permissions = membership.role.rolePermissions.map((rp) => rp.permission.code);
    return true;
  }
}
