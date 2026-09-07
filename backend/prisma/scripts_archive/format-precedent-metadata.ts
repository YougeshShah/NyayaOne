import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Merges ANY short "label:" followed by a newline and its value onto one
// line ("भाग:\n५६" -> "भाग: ५६", "दस्तखतः\nरमेश शर्मा" -> "दस्तखतः रमेश
// शर्मा", etc.) — this pattern repeats throughout the whole document
// (metadata header, signature block, and other label/value pairs), not
// just the top section. Still a pure whitespace/layout fix: no word is
// ever added, removed, or changed, only where the line break sits. The
// label is bounded to a short run (2-30 chars, no colon/newline inside
// it) specifically so this doesn't misfire on normal multi-sentence
// judgment prose, which reads as long paragraphs rather than short
// label-value pairs.
function formatMetadataHeader(content: string): string {
  return content.replace(/([^\n:ः]{2,30})[:ः]\s*\n+\s*([^\n]{1,150})\n/g, "$1: $2\n");
}

async function main() {
  const total = await prisma.precedent.count();
  console.log(`Formatting metadata header for ${total} precedent(s)...\n`);

  const batchSize = 200;
  let processed = 0;
  let changed = 0;

  while (processed < total) {
    const batch = await prisma.precedent.findMany({
      select: { id: true, fullContent: true },
      skip: processed,
      take: batchSize,
      orderBy: { createdAt: "asc" },
    });
    if (batch.length === 0) break;

    for (const p of batch) {
      const after = formatMetadataHeader(p.fullContent);
      if (after !== p.fullContent) {
        await prisma.precedent.update({ where: { id: p.id }, data: { fullContent: after } });
        changed++;
      }
    }

    processed += batch.length;
    console.log(`Processed ${processed}/${total} — formatted so far: ${changed}`);
  }

  console.log(`\nDone. ${changed} of ${total} record(s) had their metadata header reformatted.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
