import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PrismaService } from "src/prisma/prisma.service";
import { Authz } from "src/common/decorators/authz.decorator";
import { PERMISSIONS } from "src/common/constants/permissions";
import { toPagination } from "src/common/utils/pagination";
import { CurrentUser } from "src/common/decorators/current-user.decorator";

class AuditQueryDto {
  farmId!: string;
  entityType?: string;
  entityId?: string;
  action?: string;
  page?: number;
  pageSize?: number;
}

@ApiTags("Audit")
@Controller("audit")
export class AuditController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Authz({ farm: true, permissions: [PERMISSIONS.AUDIT_VIEW] })
  async list(@Query() q: AuditQueryDto, @CurrentUser() user: any) {
    const { skip, take, page, pageSize } = toPagination(q);
    const where = {
      farmId: user.activeFarmId,
      entityType: q.entityType,
      entityId: q.entityId,
      action: q.action as any,
    };
    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({ where, orderBy: { timestamp: "desc" }, skip, take }),
      this.prisma.auditLog.count({ where }),
    ]);
    return { items, page, pageSize, total };
  }
}
