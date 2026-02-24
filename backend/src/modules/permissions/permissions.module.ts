import { Controller, Get, Module } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PrismaService } from "src/prisma/prisma.service";
import { Authz } from "src/common/decorators/authz.decorator";

@ApiTags("RBAC")
@Controller("permissions")
class PermissionsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Authz()
  async list() {
    return this.prisma.permission.findMany({ orderBy: [{ resource: "asc" }, { action: "asc" }] });
  }
}

@Module({
  controllers: [PermissionsController],
})
export class PermissionsModule {}
