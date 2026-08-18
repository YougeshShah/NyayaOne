import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Same source paths the generate service resolves server-side — see
// AUTOFILL_SOURCES in document-template.service.ts. Mapping common English
// placeholder names to these lets a template auto-fill from the case
// instead of asking the lawyer to retype something already on file.
const AUTOFILL_MAP: Record<string, string> = {
  clientname: "client.fullName",
  clientfullname: "client.fullName",
  clientaddress: "client.address",
  clientphone: "client.phone",
  clientidtype: "client.identificationType",
  clientidentificationtype: "client.identificationType",
  clientidno: "client.identificationNo",
  clientidentificationno: "client.identificationNo",
  casenumber: "case.caseNumber",
  casetitle: "case.caseTitle",
  caseno: "case.caseNumber",
  opposingparty: "case.opposingParty",
  casecategory: "case.category",
  judge: "case.judge",
  judgename: "case.judge",
  courtname: "court.name",
  courttype: "court.type",
  lawyername: "lawyer.fullName",
  firmname: "firm.name",
  today: "today",
  date: "today",
};

// "clientIdType" -> "Client Id Type" — used as a fallback label whenever
// the key doesn't map to a known auto-fill source, so a manual field still
// gets a readable name instead of the raw camelCase key.
function humanizeKey(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

function extractExistingPlaceholders(bodyTemplate: string): string[] {
  const matches = bodyTemplate.match(/\{\{(\w+)\}\}/g) ?? [];
  const keys = matches.map((m) => m.slice(2, -2));
  return Array.from(new Set(keys));
}

async function main() {
  const templates = await prisma.documentTemplate.findMany({
    select: { id: true, title: true, bodyTemplate: true, fields: true },
  });

  const needsFields = templates.filter((t) => {
    const f = t.fields as any;
    return !f || (Array.isArray(f) && f.length === 0);
  });

  console.log(`${needsFields.length} template(s) have no fields — checking for existing {{key}} placeholders...\n`);

  let fixed = 0;
  let skippedNoPlaceholders = 0;

  for (const t of needsFields) {
    if (!t.bodyTemplate) continue;
    const keys = extractExistingPlaceholders(t.bodyTemplate);

    if (keys.length === 0) {
      // No {{key}} placeholders at all — this is the dot/underscore-blank
      // case already handled by the earlier extraction script, not this one.
      skippedNoPlaceholders++;
      continue;
    }

    const fields = keys.map((key) => {
      const autoFillSource = AUTOFILL_MAP[key.toLowerCase()];
      return autoFillSource
        ? { key, label: humanizeKey(key), type: "text", autoFillSource }
        : { key, label: humanizeKey(key), type: "text" };
    });

    await prisma.documentTemplate.update({
      where: { id: t.id },
      data: { fields: fields as any },
    });

    const autoCount = fields.filter((f) => "autoFillSource" in f).length;
    console.log(`  ${t.title} — ${fields.length} field(s) (${autoCount} auto-filled, ${fields.length - autoCount} manual)`);
    fixed++;
  }

  console.log(`\nDone. ${fixed} template(s) fixed. ${skippedNoPlaceholders} had no {{key}} placeholders to work from at all.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
