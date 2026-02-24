import { Controller, Get, Module, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PrismaService } from "src/prisma/prisma.service";
import { Authz } from "src/common/decorators/authz.decorator";
import { PERMISSIONS } from "src/common/constants/permissions";
import { CurrentUser } from "src/common/decorators/current-user.decorator";

function dateRange(from?: string, to?: string) {
  return {
    gte: from ? new Date(from) : undefined,
    lte: to ? new Date(to) : undefined,
  };
}

@ApiTags("Reports")
@Controller("reports")
class ReportsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("fcr")
  @Authz({ farm: true, permissions: [PERMISSIONS.REPORTS_VIEW] })
  async fcr(@CurrentUser() user: any, @Query("batchId") batchId?: string, @Query("penId") penId?: string, @Query("from") from?: string, @Query("to") to?: string) {
    const farmId = user.activeFarmId;
    const range = dateRange(from, to);
    const feed = await this.prisma.feedingEvent.aggregate({
      where: { farmId, batchId, penId, eventDate: range, deletedAt: null },
      _sum: { totalAmountKg: true },
    });
    const weights = await this.prisma.weightRecord.findMany({
      where: { farmId, batchId, recordedAt: range, deletedAt: null },
      orderBy: { recordedAt: "asc" },
    });
    let gain = 0;
    if (weights.length >= 2) gain = weights[weights.length - 1].weightKg - weights[0].weightKg;
    const totalFeed = feed._sum.totalAmountKg ?? 0;
    return { totalFeedKg: totalFeed, weightGainKg: gain, fcr: gain > 0 ? totalFeed / gain : null };
  }

  @Get("adg")
  @Authz({ farm: true, permissions: [PERMISSIONS.REPORTS_VIEW] })
  async adg(@CurrentUser() user: any, @Query("animalId") animalId?: string, @Query("batchId") batchId?: string, @Query("from") from?: string, @Query("to") to?: string) {
    const farmId = user.activeFarmId;
    const weights = await this.prisma.weightRecord.findMany({
      where: { farmId, animalId, batchId, recordedAt: dateRange(from, to), deletedAt: null },
      orderBy: { recordedAt: "asc" },
    });
    if (weights.length < 2) return { adg: null, reason: "Not enough weight points" };
    const start = weights[0];
    const end = weights[weights.length - 1];
    const days = Math.max(1, Math.round((end.recordedAt.getTime() - start.recordedAt.getTime()) / 86400000));
    return { weightGainKg: end.weightKg - start.weightKg, days, adgKgPerDay: (end.weightKg - start.weightKg) / days };
  }

  @Get("breeding")
  @Authz({ farm: true, permissions: [PERMISSIONS.REPORTS_VIEW] })
  async breeding(@CurrentUser() user: any) {
    const farmId = user.activeFarmId;
    const [services, farrowings] = await Promise.all([
      this.prisma.serviceEvent.count({ where: { farmId, deletedAt: null } }),
      this.prisma.farrowingEvent.findMany({ where: { farmId, deletedAt: null } }),
    ]);
    const totalBornAlive = farrowings.reduce((s, f) => s + f.bornAlive, 0);
    return { services, farrowings: farrowings.length, totalBornAlive, avgBornAlive: farrowings.length ? totalBornAlive / farrowings.length : 0 };
  }

  @Get("health")
  @Authz({ farm: true, permissions: [PERMISSIONS.REPORTS_VIEW] })
  async health(@CurrentUser() user: any) {
    const farmId = user.activeFarmId;
    const [symptoms, treatments, activeWithdrawals] = await Promise.all([
      this.prisma.symptomEvent.count({ where: { farmId, deletedAt: null } }),
      this.prisma.treatmentEvent.count({ where: { farmId, deletedAt: null } }),
      this.prisma.treatmentEvent.count({ where: { farmId, deletedAt: null, withdrawalEndAt: { gt: new Date() } } }),
    ]);
    return { symptoms, treatments, activeWithdrawals };
  }

  @Get("slaughter")
  @Authz({ farm: true, permissions: [PERMISSIONS.REPORTS_VIEW] })
  async slaughter(@CurrentUser() user: any) {
    const farmId = user.activeFarmId;
    const events = await this.prisma.slaughterEvent.findMany({ where: { farmId, deletedAt: null } });
    const totalLive = events.reduce((s, e) => s + e.liveWeightKg, 0);
    const totalCarcass = events.reduce((s, e) => s + (e.carcassWeightKg ?? 0), 0);
    return {
      count: events.length,
      totalLiveWeightKg: totalLive,
      totalCarcassWeightKg: totalCarcass,
      avgDressingPercent: totalLive > 0 ? (totalCarcass / totalLive) * 100 : null,
    };
  }
}

@Module({ controllers: [ReportsController] })
export class ReportsModule {}
