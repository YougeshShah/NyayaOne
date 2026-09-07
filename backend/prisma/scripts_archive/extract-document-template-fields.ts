import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Same pattern the UI's "Analyze & Suggest Fields" button looks for — runs
// of 3+ dots or underscores, which is how these paper forms mark a blank
// to be filled in by hand. Converting each run into a {{fieldKey}} makes
// the "fill in the changeable data" step actually have fields to show.
const BLANK_PATTERN = /[.]{3,}|[_]{3,}/g;

function extractFieldsAndRewrite(bodyTemplate: string): { rewritten: string; fields: { key: string; label: string; type: string }[] } {
  const fields: { key: string; label: string; type: string }[] = [];
  let counter = 0;

  const rewritten = bodyTemplate.replace(BLANK_PATTERN, (match, offset: number) => {
    counter++;
    const key = `field_${counter}`;

    // Best-effort label: grab a short run of text immediately before the
    // blank (same line) as a hint of what it's asking for — e.g. "जिल्ला"
    // right before "..........." — falls back to a generic numbered label
    // if nothing useful precedes it. The admin is expected to rename these
    // via "Edit Template" afterward, same as the UI's own suggestion flow.
    const before = bodyTemplate.slice(Math.max(0, offset - 20), offset);
    const lastWordMatch = before.match(/([\u0900-\u097Fa-zA-Z]+)\s*[:\-÷]?\s*$/);
    const label = lastWordMatch ? lastWordMatch[1] : `Field ${counter}`;

    fields.push({ key, label, type: "text" });
    return `{{${key}}}`;
  });

  return { rewritten, fields };
}

async function main() {
  const templates = await prisma.documentTemplate.findMany({
    select: { id: true, title: true, bodyTemplate: true, fields: true },
  });

  const needsFields = templates.filter((t) => {
    const f = t.fields as any;
    return !f || (Array.isArray(f) && f.length === 0);
  });

  console.log(`${needsFields.length} of ${templates.length} template(s) need fields extracted.\n`);

  let processed = 0;
  let skippedNoBlanks = 0;

  for (const t of needsFields) {
    if (!t.bodyTemplate) continue;
    const { rewritten, fields } = extractFieldsAndRewrite(t.bodyTemplate);

    if (fields.length === 0) {
      skippedNoBlanks++;
      continue;
    }

    await prisma.documentTemplate.update({
      where: { id: t.id },
      data: { bodyTemplate: rewritten, fields: fields as any },
    });
    processed++;
    console.log(`  ${t.title} — ${fields.length} field(s)`);
  }

  console.log(`\nDone. ${processed} template(s) updated with fields, ${skippedNoBlanks} had no blank patterns to convert.`);
  console.log("Review field labels in Company Web -> Document Templates -> Edit -- the auto-detected labels are a best guess and may need renaming.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
