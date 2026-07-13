import { PrismaClient, AccountType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding base roles, permissions, and Super Admin...");

  // --- Base permissions ---
  const permissionDefs = [
    { key: "lawfirm.approve", module: "LawFirm", description: "Approve or reject law firm registrations" },
    { key: "lawfirm.suspend", module: "LawFirm", description: "Suspend an active law firm" },
    { key: "court.manage", module: "Court", description: "Create/update court records" },
    { key: "library.manage", module: "Library", description: "Upload/edit legal library resources" },
    { key: "notification.broadcast", module: "Notification", description: "Send platform-wide notifications" },
    { key: "user.manage", module: "User", description: "Manage company staff accounts" },
    { key: "auditlog.view", module: "AuditLog", description: "View system audit logs" },
  ];

  for (const p of permissionDefs) {
    await prisma.permission.upsert({
      where: { key: p.key },
      update: {},
      create: p,
    });
  }

  // --- Super Admin role (has all permissions) ---
  const allPermissions = await prisma.permission.findMany();

  const superAdminRole = await prisma.role.upsert({
    where: { name: "Super Admin" },
    update: {},
    create: {
      name: "Super Admin",
      description: "Full platform access — TrailBlaze Tech",
      isSystem: true,
    },
  });

  for (const perm of allPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: superAdminRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: superAdminRole.id, permissionId: perm.id },
    });
  }

  // --- First Super Admin user ---
  const adminEmail = "admin@trailblazetech.com";
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash("ChangeMe123!", 12);
    await prisma.user.create({
      data: {
        accountType: AccountType.COMPANY,
        fullName: "TrailBlaze Super Admin",
        email: adminEmail,
        passwordHash,
        status: "ACTIVE",
        roleId: superAdminRole.id,
      },
    });
    console.log(`Super Admin created: ${adminEmail} / ChangeMe123!  (change this password immediately)`);
  } else {
    console.log("Super Admin already exists, skipping.");
  }

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
