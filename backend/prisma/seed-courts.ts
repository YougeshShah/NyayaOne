import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Master data source for Nepal's court structure, based on the Constitution of
 * Nepal 2015 (Part 11) and the 2017 federal restructuring:
 *   - 1 Supreme Court (Kathmandu)
 *   - 7 High Courts (one per province) — additional benches can be added later
 *     the same way (type: "High Court Bench")
 *   - 77 District Courts (one per district, grouped by province)
 *   - Specialized courts/tribunals under Article 152
 *
 * "type" and "province" are free-text fields (not hardcoded enums) so new
 * court categories or benches can be added later without a schema migration —
 * matches the roadmap requirement "Allow adding new court types in the future".
 */

const HIGH_COURTS: { name: string; province: string; location: string }[] = [
  { name: "High Court Biratnagar", province: "Koshi", location: "Biratnagar" },
  { name: "High Court Janakpur", province: "Madhesh", location: "Janakpur" },
  { name: "High Court Patan", province: "Bagmati", location: "Patan, Lalitpur" },
  { name: "High Court Pokhara", province: "Gandaki", location: "Pokhara" },
  { name: "High Court Tulsipur", province: "Lumbini", location: "Tulsipur, Dang" },
  { name: "High Court Surkhet", province: "Karnali", location: "Surkhet" },
  { name: "High Court Dipayal", province: "Sudurpaschim", location: "Dipayal" },
];

const DISTRICTS_BY_PROVINCE: Record<string, string[]> = {
  Koshi: [
    "Bhojpur", "Dhankuta", "Ilam", "Jhapa", "Khotang", "Morang", "Okhaldhunga",
    "Panchthar", "Sankhuwasabha", "Solukhumbu", "Sunsari", "Taplejung", "Terhathum", "Udayapur",
  ],
  Madhesh: ["Bara", "Dhanusha", "Mahottari", "Parsa", "Rautahat", "Saptari", "Sarlahi", "Siraha"],
  Bagmati: [
    "Bhaktapur", "Chitwan", "Dhading", "Dolakha", "Kathmandu", "Kavrepalanchok",
    "Lalitpur", "Makwanpur", "Nuwakot", "Ramechhap", "Rasuwa", "Sindhuli", "Sindhupalchok",
  ],
  Gandaki: [
    "Baglung", "Gorkha", "Kaski", "Lamjung", "Manang", "Mustang", "Myagdi",
    "Nawalpur", "Parbat", "Syangja", "Tanahun",
  ],
  Lumbini: [
    "Arghakhanchi", "Banke", "Bardiya", "Dang", "Rukum East", "Gulmi",
    "Kapilvastu", "Parasi", "Palpa", "Pyuthan", "Rolpa", "Rupandehi",
  ],
  Karnali: [
    "Dailekh", "Dolpa", "Humla", "Jajarkot", "Jumla", "Kalikot",
    "Mugu", "Salyan", "Surkhet", "Rukum West",
  ],
  Sudurpaschim: [
    "Achham", "Baitadi", "Bajhang", "Bajura", "Dadeldhura", "Darchula", "Doti", "Kailali", "Kanchanpur",
  ],
};

const SPECIALIZED_COURTS: { name: string; type: string; location: string }[] = [
  { name: "Special Court", type: "Special Court", location: "Kathmandu" },
  { name: "Labour Court", type: "Labour Court", location: "Kathmandu" },
  { name: "Debt Recovery Tribunal", type: "Debt Recovery Tribunal", location: "Kathmandu" },
  { name: "Debt Recovery Appellate Tribunal", type: "Debt Recovery Tribunal", location: "Kathmandu" },
  { name: "Revenue Tribunal, Kathmandu", type: "Revenue Tribunal", location: "Kathmandu" },
  { name: "Revenue Tribunal, Pokhara", type: "Revenue Tribunal", location: "Pokhara" },
  { name: "Revenue Tribunal, Biratnagar", type: "Revenue Tribunal", location: "Biratnagar" },
  { name: "Revenue Tribunal, Nepalgunj", type: "Revenue Tribunal", location: "Nepalgunj" },
  { name: "Administrative Court", type: "Administrative Court", location: "Kathmandu" },
  { name: "Foreign Employment Tribunal", type: "Foreign Employment Tribunal", location: "Kathmandu" },
];

async function upsertCourt(data: { name: string; type: string; province?: string | null; location?: string }) {
  const existing = await prisma.court.findFirst({
    where: { name: data.name, type: data.type },
  });

  if (existing) {
    return prisma.court.update({
      where: { id: existing.id },
      data: { province: data.province ?? null, location: data.location, isActive: true },
    });
  }

  return prisma.court.create({
    data: {
      name: data.name,
      type: data.type,
      province: data.province ?? null,
      location: data.location,
    },
  });
}

async function main() {
  console.log("Seeding Nepal court structure...");

  // 1. Supreme Court (national level — no province)
  await upsertCourt({ name: "Supreme Court of Nepal", type: "Supreme Court", location: "Kathmandu" });
  console.log("  Supreme Court seeded.");

  // 2. High Courts (one per province)
  for (const hc of HIGH_COURTS) {
    await upsertCourt({ name: hc.name, type: "High Court", province: hc.province, location: hc.location });
  }
  console.log(`  ${HIGH_COURTS.length} High Courts seeded.`);

  // 3. District Courts (77, grouped by province)
  let districtCount = 0;
  for (const [province, districts] of Object.entries(DISTRICTS_BY_PROVINCE)) {
    for (const district of districts) {
      await upsertCourt({
        name: `${district} District Court`,
        type: "District Court",
        province,
        location: district,
      });
      districtCount++;
    }
  }
  console.log(`  ${districtCount} District Courts seeded.`);

  // 4. Specialized courts/tribunals (national level)
  for (const sc of SPECIALIZED_COURTS) {
    await upsertCourt({ name: sc.name, type: sc.type, location: sc.location });
  }
  console.log(`  ${SPECIALIZED_COURTS.length} specialized courts/tribunals seeded.`);

  const total = await prisma.court.count();
  console.log(`Done. Total courts in database: ${total}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
