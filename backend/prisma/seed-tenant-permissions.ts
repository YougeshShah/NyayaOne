import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// These are the permission keys a TENANT's own custom roles can be built
// from — separate from the platform-level permissions (lawfirm.approve,
// etc.) that only Company staff use. A Law Firm's "Senior Associate" role
// and an Institute's "Teacher" role both draw from this same list, since
// they're both just tenants (see TenantType on LawFirm).
const tenantPermissionDefs = [
  // Law Firm side
  { key: "case.manage", module: "Case", description: "Create, edit, and close cases" },
  { key: "hearing.manage", module: "Hearing", description: "Schedule and update hearings" },
  { key: "client.manage", module: "Client", description: "Add and edit client records" },
  { key: "document.manage", module: "Document", description: "Upload and delete case documents" },
  { key: "report.view", module: "Report", description: "View firm performance reports" },

  // Education/Institution side
  { key: "student.manage", module: "Student", description: "Add and manage this institute's own students" },
  { key: "mcq.assign", module: "Mcq", description: "Assign existing MCQs/mock tests to own students" },
  { key: "live_class.host", module: "LiveClass", description: "Schedule and host live classes for own students" },
  { key: "student_progress.view", module: "StudyProgress", description: "View own students' progress and scores" },

  // Shared — tenant self-administration
  { key: "tenant_staff.manage", module: "TenantStaff", description: "Add/remove own staff and manage their roles" },
];

async function main() {
  console.log("Seeding tenant-level permissions...");

  for (const p of tenantPermissionDefs) {
    await prisma.permission.upsert({
      where: { key: p.key },
      update: {},
      create: p,
    });
  }

  console.log(`${tenantPermissionDefs.length} tenant-level permission(s) ready.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
