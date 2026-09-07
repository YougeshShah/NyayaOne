import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Same cleanup as the import script's stripSidebarNoise -- applied here
// directly to already-imported rows so a full CSV re-import (which reads
// and re-processes all 108 files) isn't needed just to fix this.
function stripSidebarNoise(content: string): string {
  const markers = ["भर्खरै प्रकाशित नजिरहरू", "धेरै हेरिएका नजिरहरु"];
  let cutIndex = content.length;
  for (const marker of markers) {
    const idx = content.indexOf(marker);
    if (idx !== -1 && idx < cutIndex) cutIndex = idx;
  }
  return content.slice(0, cutIndex).trimEnd();
}

async function main() {
  const total = await prisma.precedent.count();
  console.log(`Checking ${total} precedent(s) for sidebar navigation noise...\n`);

  const batchSize = 200;
  let processed = 0;
  let cleaned = 0;

  while (processed < total) {
    const batch = await prisma.precedent.findMany({
      select: { id: true, fullContent: true },
      skip: processed,
      take: batchSize,
      orderBy: { createdAt: "asc" },
    });
    if (batch.length === 0) break;

    for (const p of batch) {
      const before = p.fullContent;
      const after = stripSidebarNoise(before);
      if (after !== before) {
        await prisma.precedent.update({ where: { id: p.id }, data: { fullContent: after } });
        cleaned++;
      }
    }

    processed += batch.length;
    console.log(`Processed ${processed}/${total} — cleaned so far: ${cleaned}`);
  }

  console.log(`\nDone. ${cleaned} of ${total} record(s) had sidebar noise removed.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
