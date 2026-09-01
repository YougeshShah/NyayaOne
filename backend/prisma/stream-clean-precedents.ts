// Streams nkp_master.csv (522MB, too big to load as one JS string) row by
// row, applies the same safe Devanagari line-break cleaning used before,
// and UPDATES existing Precedent rows by sourceId as it goes -- never
// inserting new rows or deleting existing ones, and never holding more
// than one row's content in memory at a time.
//
// Run from backend/ with: npx ts-node prisma/stream-clean-precedents.ts

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

async function main() {
  const filePath = path.join(process.env.HOME || "", "nkp_check", "nkp_bulk_output", "nkp_master.csv");
  const stream = fs.createReadStream(filePath, { encoding: "utf-8", highWaterMark: 1024 * 1024 });

  let header: string[] = [];
  let gotHeader = false;
  let field = "";
  let row: string[] = [];
  let inQuotes = false;

  let checked = 0;
  let updated = 0;
  let notFoundInDb = 0;
  const seen = new Set<string>();

  async function handleRow(r: string[]) {
    if (!gotHeader) {
      header = r;
      gotHeader = true;
      return;
    }
    const obj: Record<string, string> = {};
    header.forEach((h, idx) => (obj[h] = r[idx] ?? ""));
    const sourceId = obj.id;
    const content = obj.content;
    if (!sourceId || !content) return;
    if (seen.has(sourceId)) return; // keep first occurrence only
    seen.add(sourceId);

    checked++;
    const cleaned = cleanDevanagariLinebreaks(content);
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
      console.log(`Checked ${checked}, updated: ${updated}, not in DB: ${notFoundInDb}`);
    }
  }

  return new Promise<void>((resolve, reject) => {
    let pendingRows: string[][] = [];
    let processing = false;

    async function drainPending() {
      if (processing) return;
      processing = true;
      while (pendingRows.length > 0) {
        const r = pendingRows.shift()!;
        await handleRow(r);
      }
      processing = false;
    }

    stream.on("data", (chunkBuf: string | Buffer) => {
      const chunk = chunkBuf.toString();
      stream.pause();
      for (let i = 0; i < chunk.length; i++) {
        const c = chunk[i];
        if (inQuotes) {
          if (c === '"') {
            if (chunk[i + 1] === '"') {
              field += '"';
              i++;
            } else {
              inQuotes = false;
            }
          } else {
            field += c;
          }
        } else {
          if (c === '"') {
            inQuotes = true;
          } else if (c === ",") {
            row.push(field);
            field = "";
          } else if (c === "\r") {
            // skip
          } else if (c === "\n") {
            row.push(field);
            field = "";
            pendingRows.push(row);
            row = [];
          } else {
            field += c;
          }
        }
      }
      drainPending()
        .then(() => stream.resume())
        .catch(reject);
    });

    stream.on("end", async () => {
      if (field !== "" || row.length > 0) {
        row.push(field);
        pendingRows.push(row);
      }
      await drainPending();
      console.log(`\nDone. Checked: ${checked}, Updated: ${updated}, Not found in DB (skipped): ${notFoundInDb}`);
      await prisma.$disconnect();
      resolve();
    });

    stream.on("error", reject);
  });
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
