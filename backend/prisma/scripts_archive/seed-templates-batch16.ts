import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const HIGH_COURT = "सेवाग्राहीले उच्च अदालतमा पेस गर्ने निवेदनका ढाँचाहरू";

const COMMON_HC_FIELDS = [
  { key: "courtName", label: "उच्च अदालतको नाम", type: "text", autoFillSource: "court.name" },
  { key: "petitionerFatherName", label: "निवेदकको बाबु/पति को नाम", type: "text", required: true },
  { key: "petitionerDistrict", label: "निवेदकको जिल्ला", type: "text", required: true },
  { key: "petitionerMunicipality", label: "न.पा./गा.पा.", type: "text", required: true },
  { key: "petitionerWardNo", label: "वडा नं.", type: "text", required: true },
  { key: "petitionerAge", label: "निवेदकको उमेर", type: "text", required: true },
  { key: "petitionerName", label: "निवेदकको नाम", type: "text", autoFillSource: "client.fullName", required: true },
  { key: "respondentFatherName", label: "विपक्षीको बाबु/पति को नाम", type: "text" },
  { key: "respondentDistrict", label: "विपक्षीको जिल्ला", type: "text" },
  { key: "respondentMunicipality", label: "न.पा./गा.पा. (विपक्षी)", type: "text" },
  { key: "respondentWardNo", label: "वडा नं. (विपक्षी)", type: "text" },
  { key: "respondentAge", label: "विपक्षीको उमेर", type: "text" },
  { key: "respondentName", label: "विपक्षीको नाम", type: "text", autoFillSource: "case.opposingParty" },
  { key: "caseNo", label: "मुद्दा नं.", type: "text", autoFillSource: "case.caseNumber" },
  { key: "caseSubject", label: "मुद्दा", type: "text", autoFillSource: "case.category" },
  { key: "submissionDate", label: "मिति", type: "date", autoFillSource: "today" },
];

const templates = [
  {
    title: "फाराम नं. ५२ — तारेखमा बस्न पाऊँ (उच्च अदालत)",
    category: HIGH_COURT,
    description: "तारेखमा नरहने गरी मुद्दा दर्ता गराएकोमा पुनः तारेखमा बस्न पाउने निवेदन।",
    fields: [...COMMON_HC_FIELDS, { key: "reasonDetails", label: "पुनः तारेखमा बस्नुपर्ने कारण/आधार", type: "textarea", required: true }],
    bodyTemplate:
      "श्री उच्च अदालत {{courtName}} मा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : तारेखमा बस्न पाऊँ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}।\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :–\n\n" +
      "१. उपर्युक्त मुद्दामा मैले/हामीले तारेखमा नरहने गरी मुद्दा दर्ता गराएकामा मुलुकी देवानी कार्यविधि नियमावली, २०७५ को नियम २४ बमोजिम तारेखमा बस्न/तारेखमा बस्दा गुज्रिन गएकाले {{reasonDetails}} बमोजिम पुनः तारेखमा बस्न निवेदनसाथ उपस्थित भएको छु/छौं। तारेखमा रहन पाऊँ।\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ४६ — अदालती शुल्क फिर्ता पाऊँ (उच्च अदालत)",
    category: HIGH_COURT,
    description: "मिलापत्र भएकोले फिर्ता पाउने ठहरेको अदालती शुल्क फिर्ता पाउने निवेदन।",
    fields: [
      ...COMMON_HC_FIELDS,
      { key: "settlementDate", label: "मिलापत्र मिति", type: "date", required: true },
      { key: "refundAmount", label: "फिर्ता पाउने अदालती शुल्क रु.", type: "text", required: true },
    ],
    bodyTemplate:
      "श्री उच्च अदालत {{courtName}} मा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : अदालती शुल्क फिर्ता पाऊँ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौँ :–\n\n" +
      "१. उक्त मुद्दा मिति {{settlementDate}} मा मिलापत्र भएको र सो मिलापत्रअनुसार मैले/हामीले फिर्ता पाउने ठहरेको अदालती शुल्क रु. {{refundAmount}} मुलुकी देवानी कार्यविधि संहिता, २०७४ को दफा ८२ बमोजिम फिर्ता पाऊँ। आवश्यक कागजात यसैसाथ छ।\n\nसंलग्न कागजात: (क) मिलापत्रको प्रतिलिपि (ख) नागरिकता वा पहिचान खुल्ने कागजातको प्रतिलिपि (ग) अघि रकम बुझाएको भए रसिदको प्रतिलिपि\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ३२ — फौजदारी गुज्रेको तारेख थामिपाऊँ (उच्च अदालत)",
    category: HIGH_COURT,
    description: "काबुबाहिरको परिस्थितिले तारिख गुज्रन गएकोले सो तारिख थामिपाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_HC_FIELDS,
      { key: "assignedDate", label: "तोकिएको तारिख मिति", type: "date", required: true },
      { key: "lapseReason", label: "तारिख गुज्रनुको कारण", type: "textarea", required: true },
    ],
    bodyTemplate:
      "श्री उच्च अदालत {{courtName}} मा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : गुज्रेको तारिख थामिपाऊँ।\n\nमुद्दा/रिट नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखि निम्नानुसार निवेदन गर्दछु/गर्दछौं :\n\n" +
      "१. उल्लिखित मुद्दामा यस अदालतबाट मिति {{assignedDate}} गतेको तारिख तोकी पाएको थिएँ/थियौं। उक्त मितिमा अदालतमा उपस्थित भै तारिख लिनुपर्नेमा {{lapseReason}} भई तारिख गुज्रन गयो। तसर्थ मुलुकी फौजदारी कार्यविधि संहिता, २०७४ को दफा १६८(३) बमोजिम गुज्रेको तारिख थामिपाऊँ। आवश्यक प्रमाण यसैसाथ छ।\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला/बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
];

async function main() {
  console.log("Seeding Batch 16 — High Court templates (3 more)...");

  const admin = await prisma.user.findFirst({ where: { accountType: "COMPANY" } });
  if (!admin) {
    console.error("No COMPANY user found — run the main seed script first.");
    process.exit(1);
  }

  let created = 0;
  let updated = 0;
  for (const t of templates) {
    const existing = await prisma.documentTemplate.findFirst({ where: { title: t.title } });
    if (existing) {
      if (existing.fields === null) {
        await prisma.documentTemplate.update({
          where: { id: existing.id },
          data: {
            category: t.category,
            description: t.description,
            bodyTemplate: t.bodyTemplate,
            fields: t.fields as any,
          },
        });
        updated++;
        console.log(`  Backfilled fields: ${t.title}`);
      } else {
        console.log(`  Skipping (already exists): ${t.title}`);
      }
      continue;
    }
    await prisma.documentTemplate.create({
      data: {
        title: t.title,
        category: t.category,
        description: t.description,
        bodyTemplate: t.bodyTemplate,
        fields: t.fields as any,
        createdBy: admin.id,
      },
    });
    created++;
    console.log(`  Created: ${t.title}`);
  }

  console.log(`Batch 16 complete. ${created} new template(s) created. उच्च अदालत folder: 12/50+ done — more remain.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
