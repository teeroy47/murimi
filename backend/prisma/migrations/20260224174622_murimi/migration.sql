-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('ACTIVE', 'PENDING', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "AnimalType" AS ENUM ('PIG');

-- CreateEnum
CREATE TYPE "AnimalSex" AS ENUM ('MALE', 'FEMALE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "AnimalStage" AS ENUM ('PIGLET', 'GROWER', 'FINISHER', 'SOW', 'BOAR');

-- CreateEnum
CREATE TYPE "AnimalStatus" AS ENUM ('ACTIVE', 'SOLD', 'SLAUGHTERED', 'DEAD', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ScheduleTemplateType" AS ENUM ('VACCINE', 'MED');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'OVERRIDE', 'SYNC_APPLY');

-- CreateEnum
CREATE TYPE "SyncOperation" AS ENUM ('CREATE', 'UPDATE', 'DELETE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Farm" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Farm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FarmTheme" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "logoUrl" TEXT,
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "fontFamily" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FarmTheme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Membership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "status" "MembershipStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "FarmInvite" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "status" "InviteStatus" NOT NULL DEFAULT 'PENDING',
    "invitedById" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FarmInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "replacedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefreshSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Section" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "notes" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pen" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "sectionId" TEXT,
    "code" TEXT NOT NULL,
    "capacity" INTEGER,
    "notes" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Batch" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "notes" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BatchAnimal" (
    "batchId" TEXT NOT NULL,
    "animalId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BatchAnimal_pkey" PRIMARY KEY ("batchId","animalId")
);

-- CreateTable
CREATE TABLE "Animal" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "type" "AnimalType" NOT NULL DEFAULT 'PIG',
    "tag" TEXT NOT NULL,
    "sex" "AnimalSex" NOT NULL DEFAULT 'UNKNOWN',
    "dob" TIMESTAMP(3),
    "stage" "AnimalStage" NOT NULL,
    "status" "AnimalStatus" NOT NULL DEFAULT 'ACTIVE',
    "currentPenId" TEXT,
    "notes" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Animal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedType" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "notes" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeedType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RationPlan" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "feedTypeId" TEXT NOT NULL,
    "targetGPerHeadPerDay" DOUBLE PRECISION NOT NULL,
    "scheduleJson" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RationPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedingEvent" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "penId" TEXT,
    "batchId" TEXT,
    "feedTypeId" TEXT NOT NULL,
    "totalAmountKg" DOUBLE PRECISION NOT NULL,
    "headCount" INTEGER NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeedingEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeightRecord" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "animalId" TEXT,
    "batchId" TEXT,
    "weightKg" DOUBLE PRECISION NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeightRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaterCheck" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "penId" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL,
    "notes" TEXT,
    "checkedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WaterCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeatEvent" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "sowAnimalId" TEXT NOT NULL,
    "observedAt" TIMESTAMP(3) NOT NULL,
    "signsJson" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeatEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceEvent" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "sowAnimalId" TEXT NOT NULL,
    "boarAnimalId" TEXT,
    "servicedAt" TIMESTAMP(3) NOT NULL,
    "expectedFarrowAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PregnancyCheck" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "sowAnimalId" TEXT NOT NULL,
    "checkedAt" TIMESTAMP(3) NOT NULL,
    "isPregnant" BOOLEAN NOT NULL,
    "notes" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PregnancyCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FarrowingEvent" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "sowAnimalId" TEXT NOT NULL,
    "farrowedAt" TIMESTAMP(3) NOT NULL,
    "bornAlive" INTEGER NOT NULL,
    "stillborn" INTEGER NOT NULL,
    "notes" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FarrowingEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Medicine" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "defaultWithdrawalDays" INTEGER,
    "notes" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Medicine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleTemplate" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "type" "ScheduleTemplateType" NOT NULL,
    "stage" TEXT,
    "ageDays" INTEGER,
    "medicineId" TEXT,
    "notes" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduleTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SymptomEvent" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "animalId" TEXT,
    "penId" TEXT,
    "symptomsJson" JSONB NOT NULL,
    "observedAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SymptomEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TreatmentEvent" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "animalId" TEXT,
    "batchId" TEXT,
    "medicineId" TEXT NOT NULL,
    "dose" TEXT NOT NULL,
    "administeredAt" TIMESTAMP(3) NOT NULL,
    "withdrawalEndAt" TIMESTAMP(3),
    "notes" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TreatmentEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KBArticle" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "tagsJson" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KBArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiagnosisRule" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "conditionsJson" JSONB,
    "symptomsJson" JSONB NOT NULL,
    "stageConstraint" TEXT,
    "minAgeDays" INTEGER,
    "maxAgeDays" INTEGER,
    "suggestedActionsJson" JSONB,
    "suggestedMedicinesJson" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiagnosisRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SlaughterRule" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "livestockType" TEXT NOT NULL DEFAULT 'PIG',
    "stage" TEXT,
    "minWeightKg" DOUBLE PRECISION NOT NULL,
    "maxWeightKg" DOUBLE PRECISION NOT NULL,
    "minAgeDays" INTEGER,
    "requireRecentWeightDays" INTEGER,
    "blockIfWithdrawal" BOOLEAN NOT NULL DEFAULT true,
    "overrideRoleIdsJson" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SlaughterRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SlaughterEvent" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "animalId" TEXT NOT NULL,
    "slaughteredAt" TIMESTAMP(3) NOT NULL,
    "liveWeightKg" DOUBLE PRECISION NOT NULL,
    "carcassWeightKg" DOUBLE PRECISION,
    "destination" TEXT,
    "notes" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SlaughterEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OverrideEvent" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "overriddenById" TEXT NOT NULL,
    "overriddenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OverrideEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FarmMap" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "mapJson" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FarmMap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "actorUserId" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestId" TEXT,
    "deviceId" TEXT,
    "beforeJson" JSONB,
    "afterJson" JSONB,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientDevice" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceName" TEXT,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncMutationLog" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clientMutationId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "operation" "SyncOperation" NOT NULL,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resultJson" JSONB,

    CONSTRAINT "SyncMutationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChangeCursor" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" INTEGER NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ChangeCursor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "FarmTheme_farmId_key" ON "FarmTheme"("farmId");

-- CreateIndex
CREATE INDEX "Membership_farmId_userId_idx" ON "Membership"("farmId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_userId_farmId_key" ON "Membership"("userId", "farmId");

-- CreateIndex
CREATE INDEX "Role_farmId_idx" ON "Role"("farmId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_farmId_name_key" ON "Role"("farmId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_code_key" ON "Permission"("code");

-- CreateIndex
CREATE INDEX "FarmInvite_farmId_email_status_idx" ON "FarmInvite"("farmId", "email", "status");

-- CreateIndex
CREATE INDEX "RefreshSession_userId_idx" ON "RefreshSession"("userId");

-- CreateIndex
CREATE INDEX "Section_farmId_updatedAt_idx" ON "Section"("farmId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Section_farmId_name_key" ON "Section"("farmId", "name");

-- CreateIndex
CREATE INDEX "Pen_farmId_sectionId_idx" ON "Pen"("farmId", "sectionId");

-- CreateIndex
CREATE INDEX "Pen_farmId_updatedAt_idx" ON "Pen"("farmId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Pen_farmId_code_key" ON "Pen"("farmId", "code");

-- CreateIndex
CREATE INDEX "Batch_farmId_updatedAt_idx" ON "Batch"("farmId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Batch_farmId_name_key" ON "Batch"("farmId", "name");

-- CreateIndex
CREATE INDEX "Animal_farmId_currentPenId_idx" ON "Animal"("farmId", "currentPenId");

-- CreateIndex
CREATE INDEX "Animal_farmId_updatedAt_idx" ON "Animal"("farmId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Animal_farmId_tag_key" ON "Animal"("farmId", "tag");

-- CreateIndex
CREATE INDEX "FeedType_farmId_updatedAt_idx" ON "FeedType"("farmId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "FeedType_farmId_name_key" ON "FeedType"("farmId", "name");

-- CreateIndex
CREATE INDEX "RationPlan_farmId_stage_idx" ON "RationPlan"("farmId", "stage");

-- CreateIndex
CREATE INDEX "RationPlan_farmId_updatedAt_idx" ON "RationPlan"("farmId", "updatedAt");

-- CreateIndex
CREATE INDEX "FeedingEvent_farmId_eventDate_idx" ON "FeedingEvent"("farmId", "eventDate");

-- CreateIndex
CREATE INDEX "FeedingEvent_farmId_updatedAt_idx" ON "FeedingEvent"("farmId", "updatedAt");

-- CreateIndex
CREATE INDEX "WeightRecord_farmId_recordedAt_idx" ON "WeightRecord"("farmId", "recordedAt");

-- CreateIndex
CREATE INDEX "WeightRecord_farmId_animalId_recordedAt_idx" ON "WeightRecord"("farmId", "animalId", "recordedAt");

-- CreateIndex
CREATE INDEX "WeightRecord_farmId_batchId_recordedAt_idx" ON "WeightRecord"("farmId", "batchId", "recordedAt");

-- CreateIndex
CREATE INDEX "WeightRecord_farmId_updatedAt_idx" ON "WeightRecord"("farmId", "updatedAt");

-- CreateIndex
CREATE INDEX "WaterCheck_farmId_checkedAt_idx" ON "WaterCheck"("farmId", "checkedAt");

-- CreateIndex
CREATE INDEX "WaterCheck_farmId_updatedAt_idx" ON "WaterCheck"("farmId", "updatedAt");

-- CreateIndex
CREATE INDEX "HeatEvent_farmId_observedAt_idx" ON "HeatEvent"("farmId", "observedAt");

-- CreateIndex
CREATE INDEX "HeatEvent_farmId_updatedAt_idx" ON "HeatEvent"("farmId", "updatedAt");

-- CreateIndex
CREATE INDEX "ServiceEvent_farmId_servicedAt_idx" ON "ServiceEvent"("farmId", "servicedAt");

-- CreateIndex
CREATE INDEX "ServiceEvent_farmId_expectedFarrowAt_idx" ON "ServiceEvent"("farmId", "expectedFarrowAt");

-- CreateIndex
CREATE INDEX "ServiceEvent_farmId_updatedAt_idx" ON "ServiceEvent"("farmId", "updatedAt");

-- CreateIndex
CREATE INDEX "PregnancyCheck_farmId_checkedAt_idx" ON "PregnancyCheck"("farmId", "checkedAt");

-- CreateIndex
CREATE INDEX "PregnancyCheck_farmId_updatedAt_idx" ON "PregnancyCheck"("farmId", "updatedAt");

-- CreateIndex
CREATE INDEX "FarrowingEvent_farmId_farrowedAt_idx" ON "FarrowingEvent"("farmId", "farrowedAt");

-- CreateIndex
CREATE INDEX "FarrowingEvent_farmId_updatedAt_idx" ON "FarrowingEvent"("farmId", "updatedAt");

-- CreateIndex
CREATE INDEX "Medicine_farmId_updatedAt_idx" ON "Medicine"("farmId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Medicine_farmId_name_key" ON "Medicine"("farmId", "name");

-- CreateIndex
CREATE INDEX "ScheduleTemplate_farmId_updatedAt_idx" ON "ScheduleTemplate"("farmId", "updatedAt");

-- CreateIndex
CREATE INDEX "SymptomEvent_farmId_observedAt_idx" ON "SymptomEvent"("farmId", "observedAt");

-- CreateIndex
CREATE INDEX "SymptomEvent_farmId_updatedAt_idx" ON "SymptomEvent"("farmId", "updatedAt");

-- CreateIndex
CREATE INDEX "TreatmentEvent_farmId_administeredAt_idx" ON "TreatmentEvent"("farmId", "administeredAt");

-- CreateIndex
CREATE INDEX "TreatmentEvent_farmId_updatedAt_idx" ON "TreatmentEvent"("farmId", "updatedAt");

-- CreateIndex
CREATE INDEX "KBArticle_farmId_updatedAt_idx" ON "KBArticle"("farmId", "updatedAt");

-- CreateIndex
CREATE INDEX "DiagnosisRule_farmId_updatedAt_idx" ON "DiagnosisRule"("farmId", "updatedAt");

-- CreateIndex
CREATE INDEX "SlaughterRule_farmId_livestockType_updatedAt_idx" ON "SlaughterRule"("farmId", "livestockType", "updatedAt");

-- CreateIndex
CREATE INDEX "SlaughterEvent_farmId_slaughteredAt_idx" ON "SlaughterEvent"("farmId", "slaughteredAt");

-- CreateIndex
CREATE INDEX "SlaughterEvent_farmId_updatedAt_idx" ON "SlaughterEvent"("farmId", "updatedAt");

-- CreateIndex
CREATE INDEX "OverrideEvent_farmId_entityType_entityId_idx" ON "OverrideEvent"("farmId", "entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "FarmMap_farmId_key" ON "FarmMap"("farmId");

-- CreateIndex
CREATE INDEX "AuditLog_farmId_timestamp_idx" ON "AuditLog"("farmId", "timestamp");

-- CreateIndex
CREATE INDEX "AuditLog_farmId_entityType_entityId_idx" ON "AuditLog"("farmId", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "ClientDevice_farmId_userId_idx" ON "ClientDevice"("farmId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ClientDevice_farmId_id_key" ON "ClientDevice"("farmId", "id");

-- CreateIndex
CREATE INDEX "SyncMutationLog_farmId_appliedAt_idx" ON "SyncMutationLog"("farmId", "appliedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SyncMutationLog_deviceId_clientMutationId_key" ON "SyncMutationLog"("deviceId", "clientMutationId");

-- CreateIndex
CREATE INDEX "ChangeCursor_farmId_changedAt_idx" ON "ChangeCursor"("farmId", "changedAt");

-- CreateIndex
CREATE INDEX "ChangeCursor_farmId_entityType_entityId_changedAt_idx" ON "ChangeCursor"("farmId", "entityType", "entityId", "changedAt");

-- AddForeignKey
ALTER TABLE "FarmTheme" ADD CONSTRAINT "FarmTheme_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmInvite" ADD CONSTRAINT "FarmInvite_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmInvite" ADD CONSTRAINT "FarmInvite_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmInvite" ADD CONSTRAINT "FarmInvite_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshSession" ADD CONSTRAINT "RefreshSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pen" ADD CONSTRAINT "Pen_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pen" ADD CONSTRAINT "Pen_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchAnimal" ADD CONSTRAINT "BatchAnimal_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchAnimal" ADD CONSTRAINT "BatchAnimal_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "Animal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Animal" ADD CONSTRAINT "Animal_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Animal" ADD CONSTRAINT "Animal_currentPenId_fkey" FOREIGN KEY ("currentPenId") REFERENCES "Pen"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedType" ADD CONSTRAINT "FeedType_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RationPlan" ADD CONSTRAINT "RationPlan_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RationPlan" ADD CONSTRAINT "RationPlan_feedTypeId_fkey" FOREIGN KEY ("feedTypeId") REFERENCES "FeedType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedingEvent" ADD CONSTRAINT "FeedingEvent_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedingEvent" ADD CONSTRAINT "FeedingEvent_penId_fkey" FOREIGN KEY ("penId") REFERENCES "Pen"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedingEvent" ADD CONSTRAINT "FeedingEvent_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedingEvent" ADD CONSTRAINT "FeedingEvent_feedTypeId_fkey" FOREIGN KEY ("feedTypeId") REFERENCES "FeedType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeightRecord" ADD CONSTRAINT "WeightRecord_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeightRecord" ADD CONSTRAINT "WeightRecord_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "Animal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeightRecord" ADD CONSTRAINT "WeightRecord_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaterCheck" ADD CONSTRAINT "WaterCheck_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaterCheck" ADD CONSTRAINT "WaterCheck_penId_fkey" FOREIGN KEY ("penId") REFERENCES "Pen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeatEvent" ADD CONSTRAINT "HeatEvent_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeatEvent" ADD CONSTRAINT "HeatEvent_sowAnimalId_fkey" FOREIGN KEY ("sowAnimalId") REFERENCES "Animal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceEvent" ADD CONSTRAINT "ServiceEvent_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceEvent" ADD CONSTRAINT "ServiceEvent_sowAnimalId_fkey" FOREIGN KEY ("sowAnimalId") REFERENCES "Animal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceEvent" ADD CONSTRAINT "ServiceEvent_boarAnimalId_fkey" FOREIGN KEY ("boarAnimalId") REFERENCES "Animal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PregnancyCheck" ADD CONSTRAINT "PregnancyCheck_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PregnancyCheck" ADD CONSTRAINT "PregnancyCheck_sowAnimalId_fkey" FOREIGN KEY ("sowAnimalId") REFERENCES "Animal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarrowingEvent" ADD CONSTRAINT "FarrowingEvent_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarrowingEvent" ADD CONSTRAINT "FarrowingEvent_sowAnimalId_fkey" FOREIGN KEY ("sowAnimalId") REFERENCES "Animal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medicine" ADD CONSTRAINT "Medicine_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleTemplate" ADD CONSTRAINT "ScheduleTemplate_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleTemplate" ADD CONSTRAINT "ScheduleTemplate_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "Medicine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SymptomEvent" ADD CONSTRAINT "SymptomEvent_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SymptomEvent" ADD CONSTRAINT "SymptomEvent_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "Animal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SymptomEvent" ADD CONSTRAINT "SymptomEvent_penId_fkey" FOREIGN KEY ("penId") REFERENCES "Pen"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreatmentEvent" ADD CONSTRAINT "TreatmentEvent_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreatmentEvent" ADD CONSTRAINT "TreatmentEvent_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "Animal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreatmentEvent" ADD CONSTRAINT "TreatmentEvent_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreatmentEvent" ADD CONSTRAINT "TreatmentEvent_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "Medicine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KBArticle" ADD CONSTRAINT "KBArticle_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiagnosisRule" ADD CONSTRAINT "DiagnosisRule_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SlaughterRule" ADD CONSTRAINT "SlaughterRule_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SlaughterEvent" ADD CONSTRAINT "SlaughterEvent_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SlaughterEvent" ADD CONSTRAINT "SlaughterEvent_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "Animal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OverrideEvent" ADD CONSTRAINT "OverrideEvent_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OverrideEvent" ADD CONSTRAINT "OverrideEvent_overriddenById_fkey" FOREIGN KEY ("overriddenById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmMap" ADD CONSTRAINT "FarmMap_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientDevice" ADD CONSTRAINT "ClientDevice_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientDevice" ADD CONSTRAINT "ClientDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyncMutationLog" ADD CONSTRAINT "SyncMutationLog_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyncMutationLog" ADD CONSTRAINT "SyncMutationLog_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "ClientDevice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyncMutationLog" ADD CONSTRAINT "SyncMutationLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChangeCursor" ADD CONSTRAINT "ChangeCursor_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;
