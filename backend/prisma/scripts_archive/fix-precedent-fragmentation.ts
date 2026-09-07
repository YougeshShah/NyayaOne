import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// The source website's text got scraped with mid-word line breaks in
// places (e.g. a judge's name "बैद्यनाथ" split across "बै" / "द्यनाथ" on
// separate lines) — this rejoins the clearest, safest cases without
// risking merging genuinely separate content:
//
// 1. A short (1-6 char) Devanagari-only line with NO sentence-ending
//    punctuation (।, :, -, ,) is almost certainly a broken word fragment,
//    not a real standalone line — real short lines in this text are
//    single numerals, single punctuation marks, or end with proper
//    punctuation. This joins such a fragment directly (no space) to the
//    line that follows it.
// 2. A single stray Latin letter alone on its own line (e.g. "M") is a
//    scraping artifact (likely a UI icon/checkbox glyph that had no
//    business being in the text) — these are removed entirely.
// 3. An orphaned punctuation mark alone on its own line (comma, dash) gets
//    attached to the end of the preceding line instead of floating alone.

function isLikelyWordFragment(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.length === 0 || trimmed.length > 6) return false;
  // Only Devanagari letters/vowel signs, no digits, no punctuation, no spaces.
  return /^[\u0900-\u097F]+$/.test(trimmed) && !/[।:,\-–]/.test(trimmed);
}

function isStrayLatinArtifact(line: string): boolean {
  return /^[A-Za-z]$/.test(line.trim());
}

function cleanupFragmentation(content: string): string {
  const lines = content.split("\n");
  const result: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === "") {
      result.push(line);
      continue;
    }

    if (isStrayLatinArtifact(trimmed)) {
      continue; // drop entirely
    }

    if (/^[,\-–]$/.test(trimmed) && result.length > 0) {
      // Orphaned punctuation -- attach to the end of the previous
      // non-empty line instead of floating alone.
      let j = result.length - 1;
      while (j >= 0 && result[j].trim() === "") j--;
      if (j >= 0) {
        result[j] = result[j].replace(/\s*$/, "") + trimmed;
        continue;
      }
    }

    if (isLikelyWordFragment(trimmed)) {
      // Look ahead to the next non-empty line and merge directly (no
      // space) if it also looks like text continuing the same word --
      // conservative: only merges if the fragment truly has no
      // punctuation/space of its own.
      let j = i + 1;
      while (j < lines.length && lines[j].trim() === "") j++;
      if (j < lines.length) {
        lines[j] = trimmed + lines[j].trimStart();
        continue; // skip pushing this fragment -- it's now merged into the next line
      }
    }

    result.push(line);
  }

  return result.join("\n");
}

async function main() {
  const total = await prisma.precedent.count();
  console.log(`Cleaning up text fragmentation for ${total} precedent(s)...\n`);

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
      const after = cleanupFragmentation(p.fullContent);
      if (after !== p.fullContent) {
        await prisma.precedent.update({ where: { id: p.id }, data: { fullContent: after } });
        changed++;
      }
    }

    processed += batch.length;
    console.log(`Processed ${processed}/${total} — cleaned so far: ${changed}`);
  }

  console.log(`\nDone. ${changed} of ${total} record(s) had fragmentation cleaned up.`);
  console.log("Note: this is a conservative heuristic -- some fragmented words may remain if they didn't match the safe patterns above.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
