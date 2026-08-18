import { google } from "googleapis";
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ============================================================
// CONFIG — change this to your Drive folder's ID (the part of
// the URL after /folders/). Everything under it is imported.
// ============================================================
const ROOT_FOLDER_ID = "1rXBiatqYEjeILrTNGOEpsbn6bxc0EoQs";
const SERVICE_ACCOUNT_PATH = path.join(__dirname, "..", "drive-service-account.json");

if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error(`\nMissing ${SERVICE_ACCOUNT_PATH}`);
  console.error("See prisma/import-drive-legal-library.README.md for one-time setup steps (free).");
  process.exit(1);
}

const auth = new google.auth.GoogleAuth({
  keyFile: SERVICE_ACCOUNT_PATH,
  scopes: ["https://www.googleapis.com/auth/drive.readonly"],
});
const drive = google.drive({ version: "v3", auth });

// Recognized top-level and mid-level folder names get mapped to a
// sensible "type" — anything unrecognized still imports fine, it just
// falls back to using the raw folder name as the category.
const TYPE_HINTS: Record<string, string> = {
  "ऐन": "ACT",
  "अध्यादेश": "ACT",
  "मौजुदा कानून": "ACT",
  "नियमावली": "REGULATION",
  "मुद्दा": "CASE_SUMMARY",
};

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
}

async function listChildren(folderId: string): Promise<DriveFile[]> {
  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: "files(id, name, mimeType)",
    pageSize: 1000,
  });
  return (res.data.files ?? []) as DriveFile[];
}

async function downloadFileBuffer(fileId: string): Promise<Buffer> {
  const res = await drive.files.get({ fileId, alt: "media" }, { responseType: "arraybuffer" });
  return Buffer.from(res.data as ArrayBuffer);
}

// Strips the "www.lawcommission.gov.np" watermark that appears once per
// PDF page — left in place, a multi-page Act ends up with it scattered
// throughout the extracted text dozens of times.
function stripWatermarkNoise(text: string): string {
  return text
    .replace(/www\.lawcommission\.gov\.np/g, "")
    .replace(/\n[ \t]*\d{1,3}[ \t]*\n(?=\s*\n)/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  // Nepal government PDFs frequently use custom Devanagari font encodings
  // that don't map cleanly to Unicode — a normal text-layer extraction
  // (pdf-parse) reads the raw character codes and produces garbled,
  // spaced-out gibberish instead of real Devanagari text. OCR (reading the
  // rendered page as an image, the way a human would) sidesteps this
  // entirely since it doesn't depend on the PDF's internal font mapping.
  const os = require("os");
  const { execSync } = require("child_process");
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "pdf-ocr-"));
  const pdfPath = path.join(tmpDir, "doc.pdf");
  fs.writeFileSync(pdfPath, buffer);

  try {
    // Rasterize every page to a PNG at 400 DPI (poppler-utils' pdftoppm) —
    // pushed higher than the previous 300 DPI attempt, since some dense
    // government-form PDFs still produced badly garbled text at 300.
    execSync(`pdftoppm -png -r 400 "${pdfPath}" "${path.join(tmpDir, "page")}"`, { stdio: "pipe" });

    const pageFiles = fs
      .readdirSync(tmpDir)
      .filter((f) => f.startsWith("page") && f.endsWith(".png"))
      .sort();

    if (pageFiles.length === 0) {
      throw new Error("pdftoppm produced no pages");
    }

    const pageTexts: string[] = [];
    for (const pageFile of pageFiles) {
      const imgPath = path.join(tmpDir, pageFile);
      // "--psm 6" tells Tesseract to treat the image as a single uniform
      // block of text instead of trying to auto-detect columns/layout —
      // Tesseract's default auto-segmentation frequently misreads dense,
      // single-column government legal text as a multi-column or sparse
      // layout, which is what produced the badly garbled/split-character
      // output seen on some documents. Nepali-only (not nep+eng) also
      // measurably improves accuracy on documents that are pure Nepali,
      // since mixing language models can pull the recognizer toward
      // incorrect Latin-adjacent character shapes.
      const text = execSync(`tesseract "${imgPath}" stdout -l nep --psm 6`, { stdio: ["pipe", "pipe", "pipe"] }).toString("utf-8");
      pageTexts.push(text.trim());
    }

    return pageTexts.join("\n\n");
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

let imported = 0;
let updated = 0;
let skipped = 0;
let publishedById = "";

async function importFile(file: DriveFile, categoryPath: string[]) {
  const title = file.name.replace(/\.pdf$/i, "");
  const category = categoryPath.length > 0 ? categoryPath[categoryPath.length - 1] : null;
  const resourceType = categoryPath.map((c) => TYPE_HINTS[c]).find(Boolean) ?? "ACT";

  console.log(`  Importing: ${title} [${resourceType}${category ? " / " + category : ""}]`);

  let content = "";
  try {
    const buffer = await downloadFileBuffer(file.id);
    content = await extractPdfText(buffer);
    content = stripWatermarkNoise(content);
  } catch (e) {
    console.warn(`    Could not extract text for "${title}" — importing with title/category only.`);
  }

  const existing = await prisma.libraryResource.findFirst({ where: { title } });

  if (existing) {
    await prisma.libraryResource.update({
      where: { id: existing.id },
      data: { content: content || existing.content, category, type: resourceType as any },
    });
    updated++;
  } else {
    await prisma.libraryResource.create({
      data: {
        title,
        type: resourceType as any,
        category,
        content,
        isDownloadable: true,
        publishedBy: publishedById,
        // fileUrl intentionally left unset — this script imports for
        // in-app search/reading. Wire an actual re-upload step here if you
        // also want the original PDF downloadable from the platform.
      } as any,
    });
    imported++;
  }
}

async function walk(folderId: string, categoryPath: string[]) {
  const children = await listChildren(folderId);

  for (const child of children) {
    if (child.mimeType === "application/vnd.google-apps.folder") {
      console.log(`${"  ".repeat(categoryPath.length)}Folder: ${child.name}`);
      await walk(child.id, [...categoryPath, child.name]);
    } else if (child.mimeType === "application/pdf") {
      await importFile(child, categoryPath);
    } else {
      console.log(`  Skipping unsupported file type: ${child.name} (${child.mimeType})`);
      skipped++;
    }
  }
}

async function main() {
  const companyUser = await prisma.user.findFirst({ where: { accountType: "COMPANY" } });
  if (!companyUser) {
    console.error("No COMPANY account found in the database — run the main seed script first (npx ts-node prisma/seed.ts).");
    process.exit(1);
  }
  publishedById = companyUser.id;

  console.log(`Starting import from Drive folder ${ROOT_FOLDER_ID}...\n`);
  await walk(ROOT_FOLDER_ID, []);
  console.log(`\nDone. ${imported} new, ${updated} updated, ${skipped} skipped (non-PDF).`);
  console.log("Re-run this script any time you add/change files in Drive — it updates in place.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
