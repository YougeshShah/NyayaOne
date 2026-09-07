import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Same extraction logic as the import script — duplicated here rather than
// imported, since this needs to run against fullContent that's ALREADY
// been cleaned of sidebar noise (the import script's version runs during
// import, before that cleanup). Re-extracting from clean content fixes
// caseNumber/court/judges/etc. that were originally pulled from the
// site-wide "Recently Published" sidebar list instead of the record's own
// actual case details.
function clean(s: string | undefined): string | undefined {
  if (!s) return undefined;
  return s.replace(/\s+/g, " ").trim().slice(0, 500) || undefined;
}

function extractFields(content: string) {
  const court = content.match(/(सर्वोच्च अदालत|उच्च अदालत|जिल्ला अदालत)/)?.[1];
  const benchType = content.match(/(विशेष इजलास|संयुक्त इजलास|पूर्ण इजलास|एक न्यायाधीशको इजलास|डिभिजन बेञ्च)/)?.[1];
  const decisionDate = content.match(/फैसला\s*मिति\s*[:：]?\s*([०-९0-9/।]+)/)?.[1];
  const caseNumber = content.match(/(रिट\s*नं\.?|मुद्दा\s*नं\.?)\s*([\s\S]{2,40}?)(?=\n\n|मुद्दा[:ः])/)?.[0];
  const caseType = content.match(/मुद्दा[:ः]\s*([\s\S]{2,80}?)(?=निवेदक|।\n\n)/)?.[1];
  const petitioner = content.match(/निवेदक\s*[\s\S]{0,5}?\n([\s\S]{5,300}?)(?=विरूद्ध|विरुद्ध)/)?.[1];
  const respondent = content.match(/विपक्षी\s*[\s\S]{0,5}?\n([\s\S]{5,300}?)(?=\n\n)/)?.[1];
  const judgeMatches = [...content.matchAll(/(?:सम्माननीय|माननीय)[^\n]*न्यायाधीश[^\n]*\n([^\n]{3,60})/g)];
  const judges = judgeMatches.map((m) => clean(m[1])).filter(Boolean).join(", ") || undefined;

  return {
    court: clean(court),
    benchType: clean(benchType),
    decisionDate: clean(decisionDate),
    caseNumber: clean(caseNumber),
    caseType: clean(caseType),
    petitioner: clean(petitioner),
    respondent: clean(respondent),
    judges: judges ? judges.slice(0, 500) : undefined,
  };
}

async function main() {
  const total = await prisma.precedent.count();
  console.log(`Re-extracting structured fields for ${total} precedent(s) from cleaned content...\n`);

  const batchSize = 200;
  let processed = 0;
  let changed = 0;

  while (processed < total) {
    const batch = await prisma.precedent.findMany({
      select: { id: true, fullContent: true, caseNumber: true, court: true, judges: true, decisionDate: true, petitioner: true, respondent: true },
      skip: processed,
      take: batchSize,
      orderBy: { createdAt: "asc" },
    });
    if (batch.length === 0) break;

    for (const p of batch) {
      const fields = extractFields(p.fullContent);
      const isDifferent =
        fields.caseNumber !== p.caseNumber ||
        fields.court !== p.court ||
        fields.judges !== p.judges ||
        fields.decisionDate !== p.decisionDate ||
        fields.petitioner !== p.petitioner ||
        fields.respondent !== p.respondent;

      if (isDifferent) {
        await prisma.precedent.update({ where: { id: p.id }, data: fields });
        changed++;
      }
    }

    processed += batch.length;
    console.log(`Processed ${processed}/${total} — fields corrected so far: ${changed}`);
  }

  console.log(`\nDone. ${changed} of ${total} record(s) had structured fields corrected.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
