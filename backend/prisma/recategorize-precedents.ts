import { PrismaClient } from "@prisma/client";
import { detectCategory } from "../src/modules/precedent/category-detector";

const prisma = new PrismaClient();

async function main() {
  const total = await prisma.precedent.count();
  console.log(`Re-checking category for ${total} precedent(s) with the fixed detection rules...\n`);

  const batchSize = 200;
  let processed = 0;
  let changed = 0;

  while (processed < total) {
    const batch = await prisma.precedent.findMany({
      select: { id: true, fullContent: true, category: true },
      skip: processed,
      take: batchSize,
      orderBy: { createdAt: "asc" },
    });
    if (batch.length === 0) break;

    for (const p of batch) {
      const newCategory = detectCategory(p.fullContent);
      if (newCategory !== p.category) {
        await prisma.precedent.update({ where: { id: p.id }, data: { category: newCategory } });
        changed++;
      }
    }

    processed += batch.length;
    console.log(`Processed ${processed}/${total} — category changed so far: ${changed}`);
  }

  console.log(`\nDone. ${changed} of ${total} record(s) had their category corrected.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
