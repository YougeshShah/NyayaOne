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
    title: "फाराम नं. ३ — म्याद, सूचना प्रकाशन/प्रशारण गरी तामेल गरिपाऊँ (उच्च अदालत)",
    category: HIGH_COURT,
    description: "म्याद रीतपूर्वक तामेल हुन नसकेकोले राष्ट्रिय स्तरका दैनिक पत्रिकामा प्रकाशित गरी तामेल गरिपाऊँ भन्ने निवेदन।",
    fields: [...COMMON_HC_FIELDS, { key: "respondentDetails2", label: "म्याद जारी गर्नुपर्ने अर्को विपक्षीको विवरण (भए)", type: "textarea" }],
    bodyTemplate:
      "श्री उच्च अदालत {{courtName}} मा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : म्याद, सूचना प्रकाशन/प्रशारण गरी तामेल गरिपाऊँ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :\n\n" +
      "१. उपर्युक्त मुद्दामा तपसिलका प्रतिवादीको नामको म्याद रीतपूर्वक तामेल हुन नसकेको भनी तामेलदारले अदालतमा प्रतिवेदन दिएको हुनाले निजका नाममा यस अदालतबाट मुलुकी देवानी कार्यविधि संहिता, २०७४ को दफा १०५(२२) र मुलुकी फौजदारी कार्यविधि संहिता, २०७४ को दफा ६२(१) बमोजिम राष्ट्रिय स्तरका दैनिक पत्रिकामा प्रकाशित गरी म्याद तामेल गरिपाऊँ। साथै यसरी म्याद तामेल गर्दा लाग्ने दस्तुर तोकिएबमोजिम म आफैंले बुझाउने छु।\n\n" +
      "म्याद जारी गर्नुपर्ने विपक्षीको विवरण: {{respondentDetails2}}\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. २१ — अदालती शुल्क पछि बुझाउने गरी सुविधा पाऊँ (उच्च अदालत)",
    category: HIGH_COURT,
    description: "आर्थिक हैसियत कमजोर भएकोले अदालती शुल्क तत्काल दाखिला गर्न नसक्ने हुँदा पछि बुझाउने सुविधा माग्ने निवेदन।",
    fields: [
      ...COMMON_HC_FIELDS,
      { key: "requiredFeeAmount", label: "माग भएको अदालती शुल्क रु.", type: "text", required: true },
      { key: "recommendationLetter", label: "न.पा./गा.पा. को सिफारिसपत्र विवरण", type: "text" },
    ],
    bodyTemplate:
      "श्री उच्च अदालत {{courtName}} मा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : अदालती शुल्क पछि बुझाउने गरी सुविधा पाऊँ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}।\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :–\n\n" +
      "१. उपरोक्त विषयमा विपक्षी उपर प्रस्तुत मुद्दा दायर गर्न/यस अदालतको आदेशानुसार म/हामीसँगबाट माग भएअनुसारको अदालती शुल्क रु. {{requiredFeeAmount}} दाखिला गर्नुपर्ने भएकोमा मेरो/हाम्रो मुद्दा परेको सम्पत्तिबाहेक अन्य सम्पत्ति नभएकाले/आर्थिक हैसियत कमजोर भएकोले उक्त अदालती शुल्क हाल दाखिल गर्न नसक्ने हुँदा मुलुकी देवानी कार्यविधि संहिता, २०७४ को दफा ६५ बमोजिम अदालती शुल्क पछि बुझाउने गरी सुविधा पाऊँ।\n\nसंलग्न कागजात: (क) {{recommendationLetter}} को सिफारिसपत्र\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. २५ — फैसला/आदेशको जानकारी पाऊँ (उच्च अदालत)",
    category: HIGH_COURT,
    description: "फैसला/आदेशको पूर्ण पाठ तयार हुन समय लाग्ने भएकाले बेहोराको जानकारी माग्ने निवेदन।",
    fields: [...COMMON_HC_FIELDS, { key: "judgmentDate", label: "फैसला/आदेश मिति", type: "date", required: true }],
    bodyTemplate:
      "श्री उच्च अदालत {{courtName}} मा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : फैसला/आदेशको जानकारी पाऊँ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :–\n\n" +
      "1. उल्लिखित मुद्दामा सम्मानित अदालतबाट मिति {{judgmentDate}} मा फैसला/आदेश भएकोमा उच्च अदालत नियमावली, २०७३ को नियम १०७(४) बमोजिम पूर्ण पाठ तयार हुन समय लाग्ने भएकाले उक्त फैसला/आदेशको बेहोराको जानकारी पाउन म/हामी सरोकारवाला भएकाले यो निवेदन गरेको छु/छौं। उक्त मितिको फैसला/आदेशको जानकारी पाऊँ।\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
];

async function main() {
  console.log("Seeding Batch 19 — High Court templates (3 more)...");

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

  console.log(`Batch 19 complete. ${created} new template(s) created. उच्च अदालत folder: 21/50+ done — more remain.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
