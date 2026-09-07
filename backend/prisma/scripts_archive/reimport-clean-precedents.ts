// Reads ALL raw scraped CSVs from ~/nkp_check/nkp_bulk_output (the most
// complete backup source), applies the same safe Devanagari line-break
// cleaning used before, and UPDATES existing Precedent rows by sourceId --
// never inserting new rows or deleting existing ones, so no id/FK
// references (bookmarks etc.) are ever affected.
//
// Run from backend/ with: npx ts-node prisma/reimport-clean-precedents.ts

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

const DEPENDENT_CHARS = new Set("ािीुूृॄॅॆेैॉॊोौ़्ॕॖॗ".split(""));

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

// Minimal, dependency-free CSV parser that correctly handles quoted fields
// with embedded commas/newlines (RFC 4180 style), since the content field
// contains both.
function parseCSV(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += c;
      i++;
      continue;
    } else {
      if (c === '"') {
        inQuotes = true;
        i++;
        continue;
      }
      if (c === ",") {
        row.push(field);
        field = "";
        i++;
        continue;
      }
      if (c === "\r") {
        i++;
        continue;
      }
      if (c === "\n") {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
        i++;
        continue;
      }
      field += c;
      i++;
      continue;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  if (rows.length === 0) return [];
  const header = rows[0];
  return rows.slice(1).map((r) => {
    const obj: Record<string, string> = {};
    header.forEach((h, idx) => (obj[h] = r[idx] ?? ""));
    return obj;
  });
}

async function main() {
  const dir = path.join(process.env.HOME || "", "nkp_check", "nkp_bulk_output");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".csv") && f !== "errors.csv");
  console.log(`Found ${files.length} CSV files to read.`);

  const bySourceId = new Map<string, { url: string; title: string; content: string }>();

  for (const file of files) {
    const text = fs.readFileSync(path.join(dir, file), "utf-8");
    const rows = parseCSV(text);
    for (const row of rows) {
      const id = row.id;
      const content = row.content;
      if (!id || !content) continue;
      // If duplicate IDs exist across files, keep whichever has more content.
      const existing = bySourceId.get(id);
      if (!existing || content.length > existing.content.length) {
        bySourceId.set(id, { url: row.url || "", title: row.title || "", content });
      }
    }
  }

  console.log(`Total unique, non-empty records found: ${bySourceId.size}`);

  let checked = 0;
  let updated = 0;
  let notFoundInDb = 0;

  for (const [sourceId, data] of bySourceId) {
    checked++;
    const cleaned = cleanDevanagariLinebreaks(data.content);
    const result = await prisma.precedent.updateMany({
      where: { sourceId },
      data: { fullContent: cleaned },
    });
    if (result.count === 0) {
      notFoundInDb++;
    } else {
      updated++;
    }
    if (checked % 500 === 0) {
      console.log(`Checked ${checked}/${bySourceId.size}, updated: ${updated}, not in DB: ${notFoundInDb}`);
    }
  }

  console.log(`\nDone. Checked: ${checked}, Updated: ${updated}, Not found in DB (skipped): ${notFoundInDb}`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
