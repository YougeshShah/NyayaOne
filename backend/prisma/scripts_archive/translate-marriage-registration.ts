import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const NEPALI_BODY = `श्री,
दर्ता अधिकारी,
{{courtName}}

विषयः विवाह दर्ता गरिपाऊँ भन्ने निवेदन।

मिति: {{today}}

म, {{clientName}}, {{clientAddress}} बस्ने, {{clientIdType}} नं. {{clientIdNo}} धारक, विवाह दर्ता गरिपाऊँ भनी यो निवेदन पेश गर्दछु।

मुद्दा सन्दर्भः {{caseNumber}} — {{caseTitle}}
प्रतिनिधि कानून व्यवसायीः {{lawyerName}}, {{firmName}}

आवश्यक दर्ता प्रक्रिया यथाशीघ्र पूरा गरिदिनुहुन अनुरोध गर्दछु।

भवदीय,
{{clientName}}

फोनः {{clientPhone}}`;

async function main() {
  const existing = await prisma.documentTemplate.findFirst({ where: { title: "Marriage Registration Application" } });
  if (!existing) {
    console.error("Template not found — title may have changed.");
    process.exit(1);
  }

  await prisma.documentTemplate.update({
    where: { id: existing.id },
    data: {
      title: "विवाह दर्ता गरिपाऊँ भन्ने निवेदन",
      bodyTemplate: NEPALI_BODY,
      // fields (autoFillSource mappings) stay exactly as they were —
      // only the visible title and body text are translated, not the
      // {{key}} placeholders, so the existing auto-fill logic keeps working.
    },
  });

  console.log("Translated to Nepali: विवाह दर्ता गरिपाऊँ भन्ने निवेदन (was: Marriage Registration Application)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
