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

  // --- Default subscription plans ---
  const plans = [
    { name: "Free", description: "For solo lawyers just getting started", priceMonthly: 0, maxLawyers: 1, maxCases: 10, maxStorageMb: 100 },
    { name: "Basic", description: "For solo lawyers with an active practice", priceMonthly: 999, maxLawyers: 1, maxCases: 100, maxStorageMb: 1000 },
    { name: "Professional", description: "For small teams (3-5 lawyers)", priceMonthly: 2999, maxLawyers: 5, maxCases: 500, maxStorageMb: 5000 },
    { name: "Enterprise", description: "For large firms — custom pricing, unlimited usage", priceMonthly: null, maxLawyers: null, maxCases: null, maxStorageMb: null },
  ];

  for (const p of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { name: p.name },
      update: {},
      create: p,
    });
  }
  console.log("Default subscription plans seeded (Free, Basic, Professional, Enterprise).");

  // --- Example document template (marriage registration application) ---
  const existingTemplate = await prisma.documentTemplate.findFirst({ where: { title: "Marriage Registration Application" } });
  if (!existingTemplate) {
    const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
    await prisma.documentTemplate.create({
      data: {
        title: "Marriage Registration Application",
        category: "Family Law",
        description: "Standard application format for marriage registration at the local ward/municipality office.",
        bodyTemplate:
          "To,\nThe Registrar,\n{{courtName}}\n\nSubject: Application for Marriage Registration\n\n" +
          "Date: {{today}}\n\n" +
          "I, {{clientName}}, residing at {{clientAddress}}, holder of {{clientIdType}} No. {{clientIdNo}}, " +
          "hereby submit this application for marriage registration.\n\n" +
          "Case Reference: {{caseNumber}} — {{caseTitle}}\n" +
          "Representing Lawyer: {{lawyerName}}, {{firmName}}\n\n" +
          "I request that the necessary registration process be completed at your earliest convenience.\n\n" +
          "Sincerely,\n{{clientName}}\n\nPhone: {{clientPhone}}",
        createdBy: admin?.id || "system",
      },
    });
    console.log("Example document template seeded (Marriage Registration Application).");
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
