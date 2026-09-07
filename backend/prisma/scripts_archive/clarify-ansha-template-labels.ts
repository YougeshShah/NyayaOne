import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// This document's structure (understood by reading the actual bodyTemplate):
// "{{field_1}}को छोरा÷छोरी÷पति÷पत्नी{{field_2}}जिल्ला{{field_3}}गा.पा.÷न.पा. वडा नं
//  {{field_4}}बस्ने वर्ष{{field_5}}का नाउँमा{{field_6}} जिल्ला अदालतबाट जारी भएको पन्ध्र दिने म्याद ।
//  {{field_7}}वादी र{{field_8}}प्रतिवादी भएको{{field_9}}मुद्दामा{{field_10}}अदालतबाट मिति
//  {{field_11}}मा अंशबण्डा गरी दिने गरी अन्तिम फैसला भएकोमा..."
// Each label below spells out what to actually type there, not just the
// bare word that happened to sit next to the blank in the original form.
const CLEAR_LABELS: Record<string, string> = {
  field_1: "सम्बन्धित व्यक्तिको नाम (जसको छोरा/छोरी/पति/पत्नी हो)",
  field_2: "जिल्लाको नाम",
  field_3: "गाउँपालिका/नगरपालिकाको नाम",
  field_4: "वडा नं.",
  field_5: "उमेर (वर्ष)",
  field_6: "म्याद पाउने व्यक्तिको नाम",
  field_7: "वादीको नाम",
  field_8: "प्रतिवादीको नाम",
  field_9: "मुद्दाको किसिम/नाम",
  field_10: "फैसला गर्ने अदालतको नाम",
  field_11: "फैसला भएको मिति",
  field_12: "दस्तखत गर्ने कर्मचारीको दस्तखत",
  field_13: "कर्मचारीको नाम",
  field_14: "कर्मचारीको पद",
  field_15: "साल (बि.सं., जस्तै ८१)",
  field_16: "महिनाको नाम",
  field_17: "गते (मितिको दिन)",
  field_18: "बार (जस्तै आइतबार)",
};

async function main() {
  const template = await prisma.documentTemplate.findFirst({
    where: { title: { contains: "अंश दिने वा अंशबण्डा" } },
  });

  if (!template) {
    console.error("Template not found — title may have changed.");
    process.exit(1);
  }

  const fields = (template.fields as any[]) ?? [];
  const updatedFields = fields.map((f) => (CLEAR_LABELS[f.key] ? { ...f, label: CLEAR_LABELS[f.key] } : f));

  await prisma.documentTemplate.update({
    where: { id: template.id },
    data: { fields: updatedFields as any },
  });

  console.log(`Updated ${updatedFields.length} field label(s) for: ${template.title}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
