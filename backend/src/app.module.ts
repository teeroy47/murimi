import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { FarmsModule } from "./modules/farms/farms.module";
import { MembershipsModule } from "./modules/memberships/memberships.module";
import { UsersModule } from "./modules/users/users.module";
import { RolesModule } from "./modules/roles/roles.module";
import { PermissionsModule } from "./modules/permissions/permissions.module";
import { AnimalsModule } from "./modules/animals/animals.module";
import { PensModule } from "./modules/pens/pens.module";
import { BatchesModule } from "./modules/batches/batches.module";
import { NutritionModule } from "./modules/nutrition/nutrition.module";
import { BreedingModule } from "./modules/breeding/breeding.module";
import { HealthModule } from "./modules/health/health.module";
import { SlaughterModule } from "./modules/slaughter/slaughter.module";
import { FarmMapModule } from "./modules/farm-map/farm-map.module";
import { ReportsModule } from "./modules/reports/reports.module";
import { AuditModule } from "./modules/audit/audit.module";
import { SyncModule } from "./modules/sync/sync.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    FarmsModule,
    MembershipsModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    AnimalsModule,
    PensModule,
    BatchesModule,
    NutritionModule,
    BreedingModule,
    HealthModule,
    SlaughterModule,
    FarmMapModule,
    ReportsModule,
    AuditModule,
    SyncModule,
  ],
})
export class AppModule {}
