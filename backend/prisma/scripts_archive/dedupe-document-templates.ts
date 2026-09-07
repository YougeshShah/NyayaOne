import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Nepali form numbers appear as "फाराम नं. ३७", "फाराम न ३७", "फाराम नं ३७"
// etc — the exact spacing/punctuation around "नं"/"न" and the trailing
// title text vary, but the form number itself is the true unique ID. This
// extracts it as the grouping key so near-duplicate titles collapse
// together regardless of formatting differences.
function extractFormNumber(title: string): string | null {
  const match = title.match(/फाराम\s*न[ंं]?\.?\s*([०-९0-9]+)/);
  return match ? match[1] : null;
}

// Higher score = better version to keep. Real semantic field keys
// (groomName, courtName) score higher than generic ones (field_1); each
// autoFillSource mapping is worth extra since it means less manual typing
// for the lawyer and a more carefully-built template overall.
function qualityScore(fields: any[]): number {
  if (!Array.isArray(fields) || fields.length === 0) return 0;
  let score = 0;
  for (const f of fields) {
    score += /^field_\d+$/.test(f.key) ? 1 : 3;
    if (f.autoFillSource) score += 2;
  }
  return score;
}

async function main() {
  const templates = await prisma.documentTemplate.findMany({
    select: { id: true, title: true, fields: true, createdAt: true },
  });

  const groups = new Map<string, typeof templates>();
  for (const t of templates) {
    const formNo = extractFormNumber(t.title);
    if (!formNo) continue; // no form-number pattern -- not part of this duplicate cluster, leave alone
    const key = formNo;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(t);
  }

  const duplicateGroups = Array.from(groups.entries()).filter(([, items]) => items.length > 1);
  console.log(`Found ${duplicateGroups.length} form-number(s) with duplicate entries.\n`);

  let deleted = 0;

  for (const [formNo, items] of duplicateGroups) {
    const scored = items.map((t) => ({ ...t, score: qualityScore((t.fields as any[]) ?? []) }));
    scored.sort((a, b) => b.score - a.score);

    const keep = scored[0];
    const remove = scored.slice(1);

    console.log(`फाराम नं. ${formNo}:`);
    console.log(`  KEEPING: "${keep.title}" (score ${keep.score})`);
    for (const r of remove) {
      console.log(`  DELETING duplicate: "${r.title}" (score ${r.score})`);
      await prisma.documentTemplate.delete({ where: { id: r.id } });
      deleted++;
    }
    console.log("");
  }

  console.log(`Done. ${deleted} duplicate template(s) removed, keeping the higher-quality version of each.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
