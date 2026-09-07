// Cleans mid-word line breaks in Devanagari text (an artifact from the
// original PDF/HTML scraping) across every Precedent.fullContent.
//
// Safety rule: a line is only merged into the previous line if it STARTS
// with a Devanagari "dependent" character (a matra/vowel-sign, virama, or
// nukta) -- these can never legitimately start a new line/word on their
// own, so a line break right before one is always an extraction artifact,
// never a real paragraph boundary. This means the script only ever fixes
// broken words and never risks merging two genuinely separate lines.
//
// Run from backend/ with: npx ts-node clean-precedent-linebreaks.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEPENDENT_CHARS = new Set(
  "ािीुूृॄॅॆेैॉॊोौ़्ॕॖॗ".split("")
);

function cleanDevanagariLinebreaks(text: string): string {
  const lines = text.split("\n");
  const merged: string[] = [];
  for (const line of lines) {
    if (merged.length > 0 && line.trim() !== "" && DEPENDENT_CHARS.has(line[0])) {
      merged[merged.length - 1] = merged[merged.length - 1] + line;
    } else {
      merged.push(line);
    }
  }
  return merged.join("\n");
}

async function main() {
  const total = await prisma.precedent.count();
  console.log(`Found ${total} precedents to check.`);

  let checked = 0;
  let updated = 0;
  const batchSize = 200;

  for (let skip = 0; skip < total; skip += batchSize) {
    const batch = await prisma.precedent.findMany({
      select: { id: true, fullContent: true },
      skip,
      take: batchSize,
      orderBy: { id: "asc" },
    });

    for (const row of batch) {
      checked++;
      if (!row.fullContent) continue;
      const cleaned = cleanDevanagariLinebreaks(row.fullContent);
      if (cleaned !== row.fullContent) {
        await prisma.precedent.update({
          where: { id: row.id },
          data: { fullContent: cleaned },
        });
        updated++;
      }
    }
    console.log(`Checked ${checked}/${total}, updated so far: ${updated}`);
  }

  console.log(`\nDone. Checked: ${checked}, Updated: ${updated}`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
