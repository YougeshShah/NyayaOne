import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Maps the categories used in Batch 1 & 2 to the user's exact Google Drive
// folder names, so the Step-1 dropdown in the Generate Document dialog shows
// the same court/tribunal names the user already organized their source
// documents by.
const SUPREME_COURT = "सेवाग्राहीले सर्वोच्च अदालतमा पेस गर्ने निवेदनका ढाँचाहरु";
const FOREIGN_EMPLOYMENT = "सेवाग्राहीले वैदेशिक रोजगार न्यायाधिकरणमा पेस गर्ने निवेदनका ढाँचाहरू";

const oldToNew: Record<string, string> = {
  "निवेदन (देवानी)": SUPREME_COURT,
  "निवेदन (सर्वोच्च अदालत नियमावली)": SUPREME_COURT,
  "निवेदन (देवानी/फौजदारी)": SUPREME_COURT,
  "निवेदन (फौजदारी)": SUPREME_COURT,
  "निवेदन (वैदेशिक रोजगार)": FOREIGN_EMPLOYMENT,
};

async function main() {
  console.log("Renaming template categories to match Drive folder names...");
  let updated = 0;

  for (const [oldCategory, newCategory] of Object.entries(oldToNew)) {
    const result = await prisma.documentTemplate.updateMany({
      where: { category: oldCategory },
      data: { category: newCategory },
    });
    console.log(`  "${oldCategory}" -> "${newCategory}": ${result.count} template(s) updated`);
    updated += result.count;
  }

  console.log(`Done. ${updated} template(s) recategorized.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
