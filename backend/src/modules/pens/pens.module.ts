import { Body, Controller, Get, Module, Param, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { PrismaService } from "src/prisma/prisma.service";
import { Authz } from "src/common/decorators/authz.decorator";

class CreateSectionDto {
  @IsString() name!: string;
  @IsOptional() @IsString() notes?: string;
}

class CreatePenDto {
  @IsString() code!: string;
  @IsOptional() @IsString() sectionId?: string;
}

@ApiTags("Pens/Sections")
@Controller("farms/:farmId")
class PensController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("sections")
  @Authz({ farm: true })
  listSections(@Param("farmId") farmId: string) {
    return this.prisma.section.findMany({ where: { farmId, deletedAt: null } });
  }

  @Post("sections")
  @Authz({ farm: true })
  createSection(@Param("farmId") farmId: string, @Body() dto: CreateSectionDto) {
    return this.prisma.section.create({ data: { farmId, ...dto } });
  }

  @Get("pens")
  @Authz({ farm: true })
  listPens(@Param("farmId") farmId: string) {
    return this.prisma.pen.findMany({ where: { farmId, deletedAt: null }, include: { section: true } });
  }

  @Post("pens")
  @Authz({ farm: true })
  createPen(@Param("farmId") farmId: string, @Body() dto: CreatePenDto) {
    return this.prisma.pen.create({ data: { farmId, ...dto } });
  }
}

@Module({ controllers: [PensController] })
export class PensModule {}
