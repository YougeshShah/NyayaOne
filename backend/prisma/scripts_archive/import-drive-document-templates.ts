import { google } from "googleapis";
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ============================================================
// CONFIG — the "Document Templates" folder (petition forms for
// Supreme/High/District Court, Foreign Employment Tribunal, Tahsil).
// ============================================================
const ROOT_FOLDER_ID = "1Uey0yfHcVvAtGXKGnbZhSl6fmWgh35F5";
const SERVICE_ACCOUNT_PATH = path.join(__dirname, "..", "drive-service-account.json");

if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error(`\nMissing ${SERVICE_ACCOUNT_PATH}`);
  console.error("Same service account file as the Legal Library import — if you already set that up, this reuses it.");
  process.exit(1);
}

const auth = new google.auth.GoogleAuth({
  keyFile: SERVICE_ACCOUNT_PATH,
  scopes: ["https://www.googleapis.com/auth/drive.readonly"],
});
const drive = google.drive({ version: "v3", auth });

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

// Google Docs (not PDF) — export as plain text via the Drive API's export endpoint.
async function exportGoogleDocText(fileId: string): Promise<string> {
  const res = await drive.files.export({ fileId, mimeType: "text/plain" }, { responseType: "text" });
  return (res.data as string) ?? "";
}

let imported = 0;
let updated = 0;
let skipped = 0;
let createdById = "";

async function importFile(file: DriveFile, categoryPath: string[]) {
  const title = file.name;
  // The first-level folder name is the court/body this form is filed at —
  // e.g. "सेवाग्राहीले सर्वोच्च अदालतमा पेस गर्ने निवेदनका ढाँचाहरु".
  const category = categoryPath.length > 0 ? categoryPath[0] : null;

  console.log(`  Importing: ${title} [${category}]`);

  let content = "";
  try {
    content = await exportGoogleDocText(file.id);
  } catch (e) {
    console.warn(`    Could not export text for "${title}" — skipping.`);
    skipped++;
    return;
  }

  const existing = await prisma.documentTemplate.findFirst({ where: { title } });

  if (existing) {
    await prisma.documentTemplate.update({
      where: { id: existing.id },
      data: { bodyTemplate: content, category } as any,
    });
    updated++;
  } else {
    await prisma.documentTemplate.create({
      data: {
        title,
        category,
        bodyTemplate: content,
        createdBy: createdById,
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
    } else if (child.mimeType === "application/vnd.google-apps.document") {
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
    console.error("No COMPANY account found — run the main seed script first.");
    process.exit(1);
  }
  createdById = companyUser.id;

  console.log(`Starting import from Drive folder ${ROOT_FOLDER_ID}...\n`);
  await walk(ROOT_FOLDER_ID, []);
  console.log(`\nDone. ${imported} new, ${updated} updated, ${skipped} skipped.`);
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
