import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// All 77 districts of Nepal, English -> Nepali (Devanagari).
const DISTRICT_NEPALI: Record<string, string> = {
  Bhojpur: "भोजपुर", Dhankuta: "धनकुटा", Ilam: "इलाम", Jhapa: "झापा", Khotang: "खोटाङ",
  Morang: "मोरङ", Okhaldhunga: "ओखलढुङ्गा", Panchthar: "पाँचथर", Sankhuwasabha: "संखुवासभा",
  Solukhumbu: "सोलुखुम्बु", Sunsari: "सुनसरी", Taplejung: "ताप्लेजुङ", Terhathum: "तेह्रथुम", Udayapur: "उदयपुर",
  Bara: "बारा", Dhanusha: "धनुषा", Mahottari: "महोत्तरी", Parsa: "पर्सा", Rautahat: "रौतहट",
  Saptari: "सप्तरी", Sarlahi: "सर्लाही", Siraha: "सिराहा",
  Bhaktapur: "भक्तपुर", Chitwan: "चितवन", Dhading: "धादिङ", Dolakha: "दोलखा", Kathmandu: "काठमाडौं",
  Kavrepalanchok: "काभ्रेपलाञ्चोक", Lalitpur: "ललितपुर", Makwanpur: "मकवानपुर", Nuwakot: "नुवाकोट",
  Ramechhap: "रामेछाप", Rasuwa: "रसुवा", Sindhuli: "सिन्धुली", Sindhupalchok: "सिन्धुपाल्चोक",
  Baglung: "बागलुङ", Gorkha: "गोरखा", Kaski: "कास्की", Lamjung: "लमजुङ", Manang: "मनाङ",
  Mustang: "मुस्ताङ", Myagdi: "म्याग्दी", Nawalpur: "नवलपुर", Parbat: "पर्वत", Syangja: "स्याङ्जा", Tanahun: "तनहुँ",
  Arghakhanchi: "अर्घाखाँची", Banke: "बाँके", Bardiya: "बर्दिया", Dang: "दाङ",
  "Eastern Rukum": "रुकुम पूर्व", "Rukum East": "रुकुम पूर्व", Gulmi: "गुल्मी", Kapilvastu: "कपिलवस्तु",
  Nawalparasi: "नवलपरासी", Palpa: "पाल्पा", Pyuthan: "प्युठान", Rolpa: "रोल्पा", Rupandehi: "रुपन्देही",
  Dailekh: "दैलेख", Dolpa: "डोल्पा", Humla: "हुम्ला", Jajarkot: "जाजरकोट", Jumla: "जुम्ला",
  Kalikot: "कालिकोट", Mugu: "मुगु", Salyan: "सल्यान", Surkhet: "सुर्खेत",
  "Western Rukum": "रुकुम पश्चिम", "Rukum West": "रुकुम पश्चिम",
  Achham: "अछाम", Baitadi: "बैतडी", Bajhang: "बझाङ", Bajura: "बाजुरा", Dadeldhura: "डडेलधुरा",
  Darchula: "दार्चुला", Kailali: "कैलाली", Kanchanpur: "कञ्चनपुर", Doti: "डोटी",
};

// High Courts and their seat cities.
const HIGH_COURT_NEPALI: Record<string, string> = {
  "High Court Patan": "उच्च अदालत पाटन",
  "High Court Dipayal": "उच्च अदालत दिपायल",
  "High Court Surkhet": "उच्च अदालत सुर्खेत",
  "High Court Butwal": "उच्च अदालत बुटवल",
  "High Court Pokhara": "उच्च अदालत पोखरा",
  "High Court Janakpur": "उच्च अदालत जनकपुर",
  "High Court Biratnagar": "उच्च अदालत विराटनगर",
};

// Special courts / tribunals — matched by exact name.
const SPECIAL_COURT_NEPALI: Record<string, string> = {
  "Supreme Court of Nepal": "सर्वोच्च अदालत",
  "Special Court": "विशेष अदालत",
  "Labour Court": "श्रम अदालत",
  "Debt Recovery Tribunal": "ऋण असुली न्यायाधिकरण",
  "Debt Recovery Appellate Tribunal": "ऋण असुली पुनरावेदन न्यायाधिकरण",
  "Administrative Court": "प्रशासकीय अदालत",
  "Foreign Employment Tribunal": "वैदेशिक रोजगार न्यायाधिकरण",
};

function districtNepaliName(district: string): string | null {
  return DISTRICT_NEPALI[district] || null;
}

function guessNepaliName(englishName: string, type: string): string | null {
  // Exact matches first
  if (SPECIAL_COURT_NEPALI[englishName]) return SPECIAL_COURT_NEPALI[englishName];
  if (HIGH_COURT_NEPALI[englishName]) return HIGH_COURT_NEPALI[englishName];

  // "Revenue Tribunal, <City>" pattern
  const revenueMatch = englishName.match(/^Revenue Tribunal,\s*(.+)$/);
  if (revenueMatch) {
    const city = revenueMatch[1].trim();
    const cityNepali = DISTRICT_NEPALI[city] || city;
    return `राजस्व न्यायाधिकरण, ${cityNepali}`;
  }

  // "<District> District Court" pattern
  const districtMatch = englishName.match(/^(.+?)\s+District Court$/);
  if (districtMatch) {
    const district = districtMatch[1].trim();
    const nepali = districtNepaliName(district);
    if (nepali) return `${nepali} जिल्ला अदालत`;
  }

  return null; // unmatched — leave nepaliName blank rather than guess wrong
}

async function main() {
  console.log("Populating Nepali names for all seeded courts...");
  const courts = await prisma.court.findMany();

  let updated = 0;
  let skipped = 0;

  for (const court of courts) {
    if (court.nepaliName) {
      skipped++;
      continue;
    }
    const nepaliName = guessNepaliName(court.name, court.type);
    if (nepaliName) {
      await prisma.court.update({ where: { id: court.id }, data: { nepaliName } });
      updated++;
    } else {
      console.log(`  Could not auto-translate: "${court.name}" (${court.type}) — left blank, add manually via Edit if needed.`);
    }
  }

  console.log(`Done. ${updated} court(s) updated with Nepali names, ${skipped} already had one.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
