import { Body, Controller, Get, Module, Put, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PrismaService } from "src/prisma/prisma.service";
import { Authz } from "src/common/decorators/authz.decorator";
import { PERMISSIONS } from "src/common/constants/permissions";
import { CurrentUser } from "src/common/decorators/current-user.decorator";

class FarmMapDto {
  mapJson!: unknown;
}

@ApiTags("Farm Map")
@Controller("farm-map")
class FarmMapController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Authz({ farm: true, permissions: [PERMISSIONS.MAP_VIEW] })
  async get(@CurrentUser() user: any) {
    const farmId = user.activeFarmId;
    return this.prisma.farmMap.findUnique({ where: { farmId } });
  }

  @Put()
  @Authz({ farm: true, permissions: [PERMISSIONS.MAP_EDIT] })
  async put(@Body() dto: FarmMapDto, @CurrentUser() user: any) {
    const farmId = user.activeFarmId;
    return this.prisma.farmMap.upsert({
      where: { farmId },
      create: { farmId, mapJson: dto.mapJson as any },
      update: { mapJson: dto.mapJson as any, version: { increment: 1 } },
    });
  }
}

@Module({ controllers: [FarmMapController] })
export class FarmMapModule {}
