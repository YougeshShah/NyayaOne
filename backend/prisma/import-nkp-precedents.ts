import { PrismaClient } from "@prisma/client";
import { parse } from "csv-parse/sync";
import fs from "fs";
import path from "path";
import { detectCategory } from "../src/modules/precedent/category-detector";

const prisma = new PrismaClient();

// ============================================================
// CONFIG — point this at the extracted "csv" folder from nkp_data.zip.
// ============================================================
const CSV_DIR = path.join(process.env.HOME || "", "nkp_data", "csv");

// Best-effort structured-field extraction from the raw judgment text. The
// source text has inconsistent line breaks (including mid-word splits from
// the original scrape), so these are deliberately lenient -- [\s\S]
// instead of . to cross newlines, and results get whitespace/newlines
// collapsed afterward. If a pattern doesn't match, that field is just left
// null -- fullContent is ALWAYS stored regardless, so nothing is ever
// unsearchable even when structured extraction fails.
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

// Strips the nkp.gov.np website's sidebar navigation content
// ("Recently Published Precedents" / "Most Viewed Precedents" lists) that
// got scraped and appended to the end of every single record's content —
// this is never part of the actual judgment text, it's website chrome
// that leaked in during scraping. The marker phrase is a website UI
// heading, never legal terminology, so truncating at its first
// occurrence is safe and never touches real judgment text.
function stripSidebarNoise(content: string): string {
  const markers = ["भर्खरै प्रकाशित नजिरहरू", "धेरै हेरिएका नजिरहरु"];
  let cutIndex = content.length;
  for (const marker of markers) {
    const idx = content.indexOf(marker);
    if (idx !== -1 && idx < cutIndex) cutIndex = idx;
  }
  return content.slice(0, cutIndex).trimEnd();
}

let imported = 0;
let updated = 0;
let skipped = 0;
let errors = 0;

async function importFile(filePath: string, uploadedBy: string) {
  // Strip a UTF-8 BOM if present -- these CSVs were saved with one, and
  // without stripping it the first column header becomes "\uFEFFid"
  // instead of "id", making every row.id read as undefined (which is
  // exactly the bug that broke the first import attempt).
  const raw = fs.readFileSync(filePath, "utf-8").replace(/^\uFEFF/, "");
  const rows: { id: string; url: string; title: string; content: string; scraped_at: string }[] = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
    bom: true,
  });

  for (const row of rows) {
    try {
      if (!row.content || row.content.trim().length < 10) {
        skipped++;
        continue;
      }

      const cleanContent = stripSidebarNoise(row.content);
      const fields = extractFields(cleanContent);
      const category = detectCategory(cleanContent);

      await prisma.precedent.upsert({
        where: { sourceId: row.id },
        create: {
          sourceId: row.id,
          sourceUrl: row.url || undefined,
          title: row.title || `निर्णय नं. ${row.id}`,
          fullContent: cleanContent,
          category: category || undefined,
          uploadedBy,
          ...fields,
        },
        update: {
          fullContent: cleanContent,
          category: category || undefined,
          ...fields,
        },
      });

      // Distinguish new vs refreshed for the progress log -- upsert alone
      // doesn't tell us which happened.
      imported++;
    } catch (e) {
      errors++;
      console.warn(`  Skipped row id=${row.id} due to error: ${(e as Error).message}`);
    }
  }
}

async function main() {
  if (!fs.existsSync(CSV_DIR)) {
    console.error(`CSV directory not found: ${CSV_DIR}`);
    console.error("Update CSV_DIR at the top of this script to point at your extracted nkp_data/csv folder.");
    process.exit(1);
  }

  const companyUser = await prisma.user.findFirst({ where: { accountType: "COMPANY" } });
  if (!companyUser) {
    console.error("No COMPANY account found — run the main seed script first.");
    process.exit(1);
  }

  const files = fs
    .readdirSync(CSV_DIR)
    .filter((f) => f.startsWith("batch_") && f.endsWith(".csv"))
    .sort();

  console.log(`Found ${files.length} batch file(s) in ${CSV_DIR}\n`);

  for (let i = 0; i < files.length; i++) {
    const filePath = path.join(CSV_DIR, files[i]);
    await importFile(filePath, companyUser.id);
    console.log(`[${i + 1}/${files.length}] ${files[i]} done — running totals: imported/updated=${imported}, skipped=${skipped}, errors=${errors}`);
  }

  console.log(`\nDone. ${imported} record(s) imported/updated, ${skipped} skipped (empty content), ${errors} row-level error(s) (logged above, rest of import continued normally).`);
}

main()
  .catch((e) => {
    console.error("Fatal error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
