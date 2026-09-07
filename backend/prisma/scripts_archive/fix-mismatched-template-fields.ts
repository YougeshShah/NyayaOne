import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const BLANK_PATTERN = /[.]{3,}|[_]{3,}/g;

function extractFieldsAndRewrite(bodyTemplate: string): { rewritten: string; fields: { key: string; label: string; type: string }[] } {
  const fields: { key: string; label: string; type: string }[] = [];
  let counter = 0;

  const rewritten = bodyTemplate.replace(BLANK_PATTERN, (match, offset: number) => {
    counter++;
    const key = `field_${counter}`;
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

  console.log(`Checking ${templates.length} template(s) for field/body mismatches...\n`);

  let mismatched = 0;
  let clean = 0;
  let alreadyEmpty = 0;

  for (const t of templates) {
    if (!t.bodyTemplate) continue;
    const fields = (t.fields as any[]) ?? [];

    if (fields.length === 0) {
      alreadyEmpty++;
      continue;
    }

    // A template is mismatched if ANY of its declared fields' {{key}} does
    // NOT actually appear in the current bodyTemplate — meaning the body
    // was overwritten (e.g. by the Drive re-import) after the fields were
    // originally set, so the fill-in form would ask for values that never
    // get inserted anywhere in the generated document.
    const missingKeys = fields.filter((f) => !t.bodyTemplate!.includes(`{{${f.key}}}`));

    if (missingKeys.length === 0) {
      clean++;
      continue;
    }

    // Re-derive fields from the CURRENT body content instead — same
    // approach as the earlier bulk extraction, so the form the lawyer
    // sees always matches what the generated PDF will actually contain.
    const { rewritten, fields: newFields } = extractFieldsAndRewrite(t.bodyTemplate);

    if (newFields.length === 0) {
      // Body has no blank patterns left to extract — clear the stale
      // fields so the form doesn't ask for values that go nowhere.
      await prisma.documentTemplate.update({ where: { id: t.id }, data: { fields: [] } });
      console.log(`  Cleared stale fields (no blanks found in body): ${t.title}`);
    } else {
      await prisma.documentTemplate.update({
        where: { id: t.id },
        data: { bodyTemplate: rewritten, fields: newFields as any },
      });
      console.log(`  Fixed mismatch (${missingKeys.length} stale key(s)) -> ${newFields.length} new field(s): ${t.title}`);
    }
    mismatched++;
  }

  console.log(`\nDone. ${mismatched} template(s) had mismatched fields and were fixed.`);
  console.log(`${clean} template(s) were already consistent, ${alreadyEmpty} had no fields (skipped).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
