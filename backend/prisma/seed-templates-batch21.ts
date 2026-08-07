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
    title: "फाराम नं. १६ — साक्षी हाजिर गराई बकपत्र गराइपाऊँ (उच्च अदालत)",
    category: HIGH_COURT,
    description: "फिरादपत्र/प्रतिउत्तरपत्रमा उल्लिखित साक्षी लिई हाजिर भई बकपत्र गराइपाऊँ भन्ने निवेदन।",
    fields: [...COMMON_HC_FIELDS, { key: "witnessList", label: "साक्षी(हरू)को नाम, जिल्ला, न.पा./गा.पा., वडा नं., उमेर", type: "textarea", required: true }],
    bodyTemplate:
      "श्री उच्च अदालत {{courtName}} मा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : साक्षी हाजिर गराई बकपत्र गराइपाऊँ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :–\n\n" +
      "१. मुलुकी देवानी कार्यविधि संहिता, २०७४ को दफा १७९, १८३, १८६ बमोजिम/मुलुकी फौजदारी कार्यविधि संहिता, २०७४ को दफा १०१, १०६ बमोजिम उल्लिखित मुद्दामा सम्मानित अदालतको आदेशबमोजिम फिरादपत्र र प्रतिउत्तरपत्र/बयानको प्रमाण खण्डमा उल्लिखित साक्षी लिई हाजिर हुन आउनु भनी मलाई/हामीलाई आजको तारिख तोकी पाएकोमा तपसिलमा उल्लिखित साक्षी लिई उपस्थित भएको छु/छौं। हाजिर गराई अड्डाको तर्फबाट/आफ्नै तर्फबाट/कानून व्यवसायीमार्फत बकपत्र गराइपाऊँ।\n\nसाक्षी विवरण: {{witnessList}}\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. २२ — छुट प्रमाण पेस गरेको बारे (उच्च अदालत)",
    category: HIGH_COURT,
    description: "फिराद/प्रतिउत्तर दर्ता गर्दा पेस गर्न छुट भएको प्रमाण पेसी तारिख अगावै पेस गर्ने निवेदन।",
    fields: [...COMMON_HC_FIELDS, { key: "missedEvidenceDetails", label: "छुट भएको प्रमाणको विवरण र कारण", type: "textarea", required: true }],
    bodyTemplate:
      "श्री उच्च अदालत {{courtName}} मा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : छुट प्रमाण पेस गरेको बारे।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :–\n\n" +
      "1. उल्लिखित मुद्दामा प्रमाण लाग्ने निम्न कागज {{missedEvidenceDetails}} कारणले पेस गर्न छुट भएको हुनाले पेसी तारिख अघि नै उच्च अदालत नियमावली, २०७३ को नियम ८८ बमोजिम छुट प्रमाण पेस गरेको छु। मिसिल सामेल राखिपाऊँ।\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
];

async function main() {
  console.log("Seeding Batch 21 — High Court templates (2 more)...");

  const admin = await prisma.user.findFirst({ where: { accountType: "COMPANY" } });
  if (!admin) {
    console.error("No COMPANY user found — run the main seed script first.");
    process.exit(1);
  }

  let created = 0;
  for (const t of templates) {
    const existing = await prisma.documentTemplate.findFirst({ where: { title: t.title } });
    if (existing) {
      console.log(`  Skipping (already exists): ${t.title}`);
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

  console.log(`Batch 21 complete. ${created} new template(s) created. उच्च अदालत folder: 26/50+ done — more remain.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
