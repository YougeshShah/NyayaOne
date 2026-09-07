import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const templates = await prisma.documentTemplate.findMany({
    where: { fields: { not: null } as any },
    select: { id: true, title: true, bodyTemplate: true, fields: true },
  });

  let totalGeneric = 0;

  for (const t of templates) {
    const fields = (t.fields as any[]) ?? [];
    const generic = fields.filter(
      (f) => /^field_\d+$/.test(f.key) && /^(Field \d+|विवरण \d+)$/.test(f.label)
    );
    if (generic.length === 0) continue;

    console.log(`\n=== ${t.title} (${generic.length} generic of ${fields.length}) ===`);
    totalGeneric += generic.length;

    for (const f of generic) {
      const tag = `{{${f.key}}}`;
      const idx = t.bodyTemplate ? t.bodyTemplate.indexOf(tag) : -1;
      if (idx === -1) {
        console.log(`  ${f.key}: [tag not found in body]`);
        continue;
      }
      const before = t.bodyTemplate!.slice(Math.max(0, idx - 30), idx);
      const after = t.bodyTemplate!.slice(idx + tag.length, idx + tag.length + 20);
      console.log(`  ${f.key} (${f.label}): ...${before}[[${tag}]]${after}...`);
    }
  }

  console.log(`\nTotal generic fields remaining: ${totalGeneric}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
