import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// The Drive import script set title/category/bodyTemplate/createdBy but
// never touched "fields" — if the Generate Document UI expects an array
// there (e.g. template.fields.map(...)) and gets null/undefined instead,
// that crashes the fill-in-fields step. This sets a safe empty array on
// every imported template that's missing it, without touching anything
// that already has fields defined (e.g. templates created by hand).

async function main() {
  const templates = await prisma.documentTemplate.findMany({
    where: { fields: null } as any,
    select: { id: true, title: true },
  });

  console.log(`Found ${templates.length} template(s) with no fields defined.`);

  for (const t of templates) {
    await prisma.documentTemplate.update({
      where: { id: t.id },
      data: { fields: [] } as any,
    });
  }

  console.log(`Done. Set empty fields array on ${templates.length} template(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
