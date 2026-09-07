import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Common Nepali form-field words — if either the text right before OR
// right after a blank contains one of these, it's a much stronger signal
// than "whatever word happened to precede it", which is what produced
// generic "Field 1" labels in the first pass.
const KEYWORD_LABELS: { pattern: RegExp; label: string }[] = [
  { pattern: /जिल्ला/, label: "जिल्ला" },
  { pattern: /गा\.?पा\.?|न\.?पा\.?/, label: "गा.पा./न.पा." },
  { pattern: /वडा\s*नं/, label: "वडा नं." },
  { pattern: /उमेर/, label: "उमेर" },
  { pattern: /नाम/, label: "नाम" },
  { pattern: /मिति/, label: "मिति" },
  { pattern: /वर्ष/, label: "वर्ष" },
  { pattern: /मुद्दा\s*नं/, label: "मुद्दा नं." },
  { pattern: /ठेगाना/, label: "ठेगाना" },
  { pattern: /पेशा/, label: "पेशा" },
  { pattern: /फोन|टेलिफोन/, label: "फोन नं." },
  { pattern: /रकम/, label: "रकम" },
  { pattern: /कारण/, label: "कारण" },
  { pattern: /वादी/, label: "वादी" },
  { pattern: /प्रतिवादी/, label: "प्रतिवादी" },
  { pattern: /विपक्षी/, label: "विपक्षी" },
  { pattern: /छोरा\s*\/?\s*छोरी|छोरा\s*वा\s*छोरी/, label: "छोरा/छोरी" },
  { pattern: /पति\s*\/?\s*पत्नी|पति\s*वा\s*पत्नी/, label: "पति/पत्नी" },
  { pattern: /कारागार/, label: "कारागार" },
  { pattern: /प्रतिनिधि/, label: "प्रतिनिधि" },
  { pattern: /अधिकृत/, label: "अधिकृत" },
];

function findLabel(before: string, after: string, fallbackIndex: number): string {
  const context = before + " " + after;
  for (const { pattern, label } of KEYWORD_LABELS) {
    if (pattern.test(context)) return label;
  }
  // Fall back to the nearest Nepali/Latin word before the blank, same as
  // the original heuristic, before giving up to a generic numbered label.
  const words = before.trim().split(/\s+/).filter(Boolean);
  const lastWord = words[words.length - 1];
  if (lastWord && /[\u0900-\u097Fa-zA-Z]/.test(lastWord)) return lastWord;
  return `विवरण ${fallbackIndex}`; // "Detail N" — still better than "Field N"
}

const BLANK_PATTERN = /\{\{field_\d+\}\}/g;

async function main() {
  // Only templates that still have the generic "field_N" keys from the
  // earlier bulk extraction — hand-crafted templates with real keys
  // (petitionerName, caseNo, etc.) are left untouched.
  const templates = await prisma.documentTemplate.findMany({
    where: { fields: { not: null } as any },
    select: { id: true, title: true, bodyTemplate: true, fields: true },
  });

  const candidates = templates.filter((t) => {
    const fields = (t.fields as any[]) ?? [];
    return fields.some((f) => /^field_\d+$/.test(f.key) && /^(Field \d+|विवरण \d+)$/.test(f.label));
  });

  console.log(`${candidates.length} template(s) have generic "Field N"/"विवरण N" labels — improving them...\n`);

  let improved = 0;

  for (const t of candidates) {
    if (!t.bodyTemplate) continue;
    const fields = (t.fields as any[]) ?? [];

    // Re-scan the body for each field_N placeholder's surrounding text,
    // since the original extraction already replaced blanks with
    // {{field_N}} tags — we search for those tags directly this time,
    // not raw dot-runs.
    const newFields = fields.map((f) => {
      if (!(/^field_\d+$/.test(f.key) && /^(Field \d+|विवरण \d+)$/.test(f.label))) return f;

      const tag = `{{${f.key}}}`;
      const idx = t.bodyTemplate!.indexOf(tag);
      if (idx === -1) return f;

      const before = t.bodyTemplate!.slice(Math.max(0, idx - 25), idx);
      const after = t.bodyTemplate!.slice(idx + tag.length, idx + tag.length + 15);
      const fallbackIndex = parseInt(f.key.replace("field_", ""), 10);

      return { ...f, label: findLabel(before, after, fallbackIndex) };
    });

    const changedCount = newFields.filter((nf, i) => nf.label !== fields[i].label).length;
    if (changedCount === 0) continue;

    await prisma.documentTemplate.update({ where: { id: t.id }, data: { fields: newFields as any } });
    console.log(`  ${t.title} — improved ${changedCount} label(s)`);
    improved++;
  }

  console.log(`\nDone. ${improved} template(s) had labels improved.`);
  console.log("Some may still show generic 'विवरण N' where no keyword matched — those need a quick manual rename in Company Web.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
