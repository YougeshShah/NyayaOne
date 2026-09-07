// Reads ALL raw scraped CSVs from ~/nkp_check/nkp_bulk_output (the most
// complete backup source), applies the same safe Devanagari line-break
// cleaning used before, and UPDATES existing Precedent rows by sourceId --
// never inserting new rows or deleting existing ones, so no id/FK
// references (bookmarks etc.) are ever affected.
//
// Run from backend/ with: node --max-old-space-size=4096 -r ts-node/register prisma/reimport-clean-precedents-v2.ts

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

// Memory-efficient CSV parser: builds each field as an array of chunks and
// joins once at the end, instead of repeated += concatenation (which is
// what caused the OOM -- V8 has to copy the whole string on every +=).
function parseCSV(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  const fieldParts: string[] = [];
  let chunkStart = 0;
  let inQuotes = false;
  const len = text.length;

  function pushField() {
    fieldParts.push(text.slice(chunkStart, i));
    const field = fieldParts.join("");
    fieldParts.length = 0;
    row.push(field);
  }

  let i = 0;
  while (i < len) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          fieldParts.push(text.slice(chunkStart, i + 1)); // include one quote
          i += 2;
          chunkStart = i;
          continue;
        }
        fieldParts.push(text.slice(chunkStart, i));
        inQuotes = false;
        i++;
        chunkStart = i;
        continue;
      }
      i++;
      continue;
    } else {
      if (c === '"') {
        // starting a quoted section -- discard the quote char itself
        chunkStart = i + 1;
        inQuotes = true;
        i++;
        continue;
      }
      if (c === ",") {
        pushField();
        i++;
        chunkStart = i;
        continue;
      }
      if (c === "\r") {
        i++;
        chunkStart = i;
        continue;
      }
      if (c === "\n") {
        pushField();
        rows.push(row);
        row = [];
        i++;
        chunkStart = i;
        continue;
      }
      i++;
      continue;
    }
  }
  if (chunkStart < len || row.length > 0) {
    pushField();
    rows.push(row);
  }
  if (rows.length === 0) return [];
  const header = rows[0];
  const out: Record<string, string>[] = [];
  for (let r = 1; r < rows.length; r++) {
    const obj: Record<string, string> = {};
    for (let h = 0; h < header.length; h++) {
      obj[header[h]] = rows[r][h] ?? "";
    }
    out.push(obj);
  }
  return out;
}

async function main() {
  const dir = path.join(process.env.HOME || "", "nkp_check", "nkp_bulk_output");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".csv") && f !== "errors.csv");
  console.log(`Found ${files.length} CSV files to read.`);

  const bySourceId = new Map<string, { url: string; title: string; content: string }>();

  for (let fi = 0; fi < files.length; fi++) {
    const file = files[fi];
    const text = fs.readFileSync(path.join(dir, file), "utf-8");
    const rows = parseCSV(text);
    for (const row of rows) {
      const id = row.id;
      const content = row.content;
      if (!id || !content) continue;
      const existing = bySourceId.get(id);
      if (!existing || content.length > existing.content.length) {
        bySourceId.set(id, { url: row.url || "", title: row.title || "", content });
      }
    }
    if ((fi + 1) % 20 === 0) {
      console.log(`Read ${fi + 1}/${files.length} files, ${bySourceId.size} unique records so far.`);
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
