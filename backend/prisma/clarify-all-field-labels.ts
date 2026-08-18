import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Maps a bare word that commonly ends up as a field label (because it sat
// next to a blank in the original paper form) to a clearer instructional
// version — e.g. "पत्नी" alone doesn't tell a lawyer what to type; "पत्नीको
// नाम" does. Only words in this dictionary get rewritten — anything not
// listed here is left alone rather than guessed at.
const CLARIFY_MAP: Record<string, string> = {
  "वादी": "वादीको नाम",
  "प्रतिवादी": "प्रतिवादीको नाम",
  "निवेदक": "निवेदकको नाम",
  "विपक्षी": "विपक्षीको नाम",
  "पति": "पतिको नाम",
  "पत्नी": "पत्नीको नाम",
  "छोरा": "छोराको नाम",
  "छोरी": "छोरीको नाम",
  "बाबु": "बाबुको नाम",
  "आमा": "आमाको नाम",
  "जिल्ला": "जिल्लाको नाम",
  "वडा": "वडा नं.",
  "नं": "नम्बर",
  "वर्ष": "उमेर (वर्ष)",
  "साल": "साल (बि.सं.)",
  "महिना": "महिनाको नाम",
  "गते": "गते (मितिको दिन)",
  "रोज": "बार (जस्तै आइतबार)",
  "मिति": "मिति",
  "मुद्दा": "मुद्दाको किसिम/नाम",
  "मुद्दामा": "मुद्दाको किसिम/नाम",
  "अदालत": "अदालतको नाम",
  "अदालतबाट": "अदालतको नाम",
  "नाउँमा": "व्यक्तिको नाम",
  "नाम": "नाम",
  "नामः": "नाम",
  "दस्तखतः": "दस्तखत",
  "पदः": "पद (जस्तै शाखा अधिकृत)",
  "रकम": "रकम (रु.मा)",
  "ठेगाना": "ठेगाना",
  // Connector/filler words that never carry real meaning as a field label
  // on their own — map them to a generic prompt instead of leaving them
  // as confusing single words like "र" or "भएको".
  "र": "थप विवरण",
  "भएको": "थप विवरण",
  "का": "थप विवरण",
};

// A label already looks instructional if it contains one of these markers
// — no need to touch it. Prevents re-processing labels already fixed by
// a targeted script like clarify-ansha-template-labels.ts.
function looksAlreadyClear(label: string): boolean {
  return /को नाम|नं\.|उमेर|बि\.सं|किसिम|थप विवरण/.test(label);
}

async function main() {
  const templates = await prisma.documentTemplate.findMany({
    select: { id: true, title: true, fields: true },
  });

  let templatesChanged = 0;
  let labelsChanged = 0;

  for (const t of templates) {
    const fields = (t.fields as any[]) ?? [];
    if (fields.length === 0) continue;

    let changedHere = 0;
    const updated = fields.map((f) => {
      if (looksAlreadyClear(f.label)) return f;
      const clearer = CLARIFY_MAP[f.label.trim()];
      if (!clearer || clearer === f.label) return f;
      changedHere++;
      return { ...f, label: clearer };
    });

    if (changedHere === 0) continue;

    await prisma.documentTemplate.update({ where: { id: t.id }, data: { fields: updated as any } });
    console.log(`  ${t.title} — clarified ${changedHere} label(s)`);
    templatesChanged++;
    labelsChanged += changedHere;
  }

  console.log(`\nDone. ${labelsChanged} label(s) clarified across ${templatesChanged} template(s).`);
  console.log("Labels not in the dictionary (e.g. rare/unusual words) were left as-is -- review those individually in Company Web if still unclear.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
