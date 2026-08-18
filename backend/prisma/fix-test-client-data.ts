import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Only 3 records exist — all test/demo data with garbage identification
// values ("22", "2232", "123" as the "type" instead of a real document
// type). Fixing these directly since they're clearly seed/test data, not
// real client records — this is not something to script generically for
// production use, just a one-time cleanup of this demo dataset.
const fixes = [
  {
    fullName: "yougesh shah",
    fullNameNepali: "युगेश शाह",
    address: "काठमाडौं",
    identificationType: "नागरिकता प्रमाणपत्र",
    identificationNo: "12-34-56-78901",
  },
  {
    fullName: "Hari Bahadur Thapa",
    fullNameNepali: "हरि बहादुर थापा",
    address: "काठमाडौं",
    identificationType: "नागरिकता प्रमाणपत्र",
    identificationNo: "23-45-67-89012",
  },
  {
    fullName: "test",
    fullNameNepali: "टेस्ट प्रयोगकर्ता",
    address: "काठमाडौं",
    identificationType: "नागरिकता प्रमाणपत्र",
    identificationNo: "34-56-78-90123",
  },
];

async function main() {
  for (const fix of fixes) {
    const client = await prisma.client.findFirst({ where: { fullName: fix.fullName } });
    if (!client) {
      console.log(`  Skipping (not found): ${fix.fullName}`);
      continue;
    }
    await prisma.client.update({
      where: { id: client.id },
      data: {
        fullNameNepali: fix.fullNameNepali,
        address: fix.address,
        identificationType: fix.identificationType,
        identificationNo: fix.identificationNo,
      },
    });
    console.log(`  Updated: ${fix.fullName} -> ${fix.fullNameNepali}`);
  }
  console.log("\nDone.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
