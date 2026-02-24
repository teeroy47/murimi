import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const permissionCodes = [
  "nutrition.view", "nutrition.edit",
  "breeding.view", "breeding.edit",
  "health.view", "health.edit",
  "slaughter.view", "slaughter.edit",
  "map.view", "map.edit",
  "reports.view",
  "audit.view",
  "settings.manage_users",
  "kb.manage",
  "animals.view", "animals.edit",
  "roles.manage",
];

async function main() {
  for (const code of permissionCodes) {
    const [resource, action] = code.split(".");
    await prisma.permission.upsert({
      where: { code },
      update: {},
      create: { code, resource, action, description: `${resource} ${action}` },
    });
  }

  const bootstrapUserEmail = process.env.SEED_ADMIN_EMAIL?.toLowerCase();
  if (bootstrapUserEmail) {
    const user = await prisma.user.findUnique({ where: { email: bootstrapUserEmail } });
    if (user) {
      const farm = await prisma.farm.create({
        data: { name: "Murimi Starter Farm", createdById: user.id },
      });
      const role = await prisma.role.create({
        data: { farmId: farm.id, name: "Admin", description: "Starter admin role", isSystem: true },
      });
      const perms = await prisma.permission.findMany();
      await prisma.rolePermission.createMany({
        data: perms.map((p) => ({ roleId: role.id, permissionId: p.id })),
        skipDuplicates: true,
      });
      await prisma.membership.upsert({
        where: { userId_farmId: { userId: user.id, farmId: farm.id } },
        update: { roleId: role.id, status: "ACTIVE" },
        create: { userId: user.id, farmId: farm.id, roleId: role.id, status: "ACTIVE" },
      });
      await prisma.kBArticle.createMany({
        data: [
          { farmId: farm.id, title: "Piglet Scours Basics", body: "Hydration, sanitation, isolate severe cases.", tagsJson: ["piglet", "diarrhea"] as any },
          { farmId: farm.id, title: "Lameness Triage", body: "Inspect hoof, flooring, swelling, and gait score.", tagsJson: ["lameness"] as any },
        ],
        skipDuplicates: true,
      });
    }
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
