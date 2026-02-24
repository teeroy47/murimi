import { Body, Controller, Get, Module, Param, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { IsArray, IsOptional, IsString } from "class-validator";
import { PrismaService } from "src/prisma/prisma.service";
import { Authz } from "src/common/decorators/authz.decorator";

class CreateBatchDto {
  @IsString() name!: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsArray() animalIds?: string[];
}

@ApiTags("Batches")
@Controller("farms/:farmId/batches")
class BatchesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Authz({ farm: true })
  list(@Param("farmId") farmId: string) {
    return this.prisma.batch.findMany({
      where: { farmId, deletedAt: null },
      include: { animals: { include: { animal: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  @Post()
  @Authz({ farm: true })
  async create(@Param("farmId") farmId: string, @Body() dto: CreateBatchDto) {
    const batch = await this.prisma.batch.create({
      data: { farmId, name: dto.name, notes: dto.notes },
    });
    if (dto.animalIds?.length) {
      await this.prisma.batchAnimal.createMany({
        data: dto.animalIds.map((animalId) => ({ batchId: batch.id, animalId })),
        skipDuplicates: true,
      });
    }
    return this.prisma.batch.findUnique({
      where: { id: batch.id },
      include: { animals: true },
    });
  }
}

@Module({ controllers: [BatchesController] })
export class BatchesModule {}
