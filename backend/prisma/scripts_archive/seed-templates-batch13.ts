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
    title: "फाराम नं. १५ — सक्कल लिखत पेस गरेको (उच्च अदालत)",
    category: HIGH_COURT,
    description: "अदालतको आदेशबमोजिम सक्कल लिखत/फोटो/अन्य प्रमाण दाखिला गरी मिसिल सामेल गरिपाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_HC_FIELDS,
      { key: "orderDate", label: "आदेश मिति", type: "date", required: true },
      { key: "documentsList", label: "पेश गरिएका सक्कल लिखत/फोटो/प्रमाणको विवरण", type: "textarea", required: true },
    ],
    bodyTemplate:
      "श्री उच्च अदालत {{courtName}} मा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : सक्कल लिखत पेस गरेको।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :–\n\n" +
      "१. उक्त मुद्दामा मुलुकी देवानी कार्यविधि संहिता, २०७४ को दफा १६५(३) बमोजिम/मुलुकी फौजदारी कार्यविधि संहिता, २०७४ को दफा १००(४) बमोजिम सम्मानित अदालतको मिति {{orderDate}} को आदेशबमोजिम तपसिलबमोजिमको सक्कल लिखत/फोटो/अन्य प्रमाण दाखिला गर्न ल्याएको छु। मिसिल सामेल गराइपाऊँ।\n\nतपसिल: {{documentsList}}\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ८ — दस्तुर दाखिला गरेको (उच्च अदालत)",
    category: HIGH_COURT,
    description: "अदालतको आदेशबमोजिम नपुग अदालती शुल्क/अन्य दस्तुर दाखिला गरी हाजिर भएको जनाउने निवेदन।",
    fields: [
      ...COMMON_HC_FIELDS,
      { key: "shortfallFeeAmount", label: "नपुग अदालती शुल्क रु.", type: "text" },
      { key: "expertTestFeeAmount", label: "विशेषज्ञ/वैज्ञानिक परीक्षण दस्तुर रु.", type: "text" },
      { key: "publicationFeeAmount", label: "म्याद/सूचना प्रकाशन दस्तुर रु.", type: "text" },
      { key: "otherFeeAmount", label: "अन्य दस्तुर रु.", type: "text" },
      { key: "bankVoucherNo", label: "बैंक दाखिला भौचर नं.", type: "text" },
    ],
    bodyTemplate:
      "श्री उच्च अदालत {{courtName}} मा पेस गरेको निवेदन पत्र\n\nविषय : दस्तुर दाखिला गरेको।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :–\n\n" +
      "१. उल्लिखित मुद्दामा मलाई/हामीलाई सम्मानित अदालतबाट देहायबमोजिमको दस्तुर लिई हाजिर हुन आउनु भनी तारिख तोकी पाएकोमा देहाय बमोजिमको दस्तुर लिई हाजिर हुन आएको छु/छौं।\n\n" +
      "मुलुकी देवानी कार्यविधि संहिता, २०७४ को दफा ७७ बमोजिम नपुग अदालती शुल्क रु. {{shortfallFeeAmount}}\n" +
      "विशेषज्ञ/वैज्ञानिक परीक्षण दस्तुर रु. {{expertTestFeeAmount}}\n" +
      "म्याद/सूचना प्रकाशन दस्तुर रु. {{publicationFeeAmount}}\n" +
      "अन्य दस्तुर रु. {{otherFeeAmount}}\n" +
      "बैंक दाखिला गरेको भौचर नं.: {{bankVoucherNo}}\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ४४ — रोक्का रहेको सम्पत्ति फुकुवा गरिपाऊँ (उच्च अदालत)",
    category: HIGH_COURT,
    description: "अनावश्यक रोक्का रहेको सम्पत्ति फुकुवा गरिपाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_HC_FIELDS,
      { key: "nationalIdNo", label: "राष्ट्रिय परिचयपत्र नं.", type: "text" },
      { key: "releaseReason", label: "फुकुवा हुनुपर्ने कारण", type: "textarea", required: true },
      { key: "propertyDetails", label: "रोक्का रहेको सम्पत्तिको विवरण", type: "textarea", required: true },
      { key: "immovablePropertyDetails", label: "फुकुवा माग गरिएको अचल सम्पत्तिको विवरण", type: "textarea", required: true },
    ],
    bodyTemplate:
      "श्री उच्च अदालत {{courtName}} मा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : रोक्का रहेको सम्पत्ति फुकुवा गरिपाऊँ।\n\nमुद्दा नं. {{caseNo}}\nराष्ट्रिय परिचयपत्र नं.: {{nationalIdNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :\n\n" +
      "१. उक्त मुद्दामा {{releaseReason}} भएकोले देहायको सम्पत्ति रोक्का राख्न नपर्ने हुँदा मुलुकी फौजदारी कार्यविधि नियमावली, २०७५ को नियम ९२(२) तथा मुलुकी देवानी कार्यविधि संहिता, २०७५ को दफा १५६ बमोजिम रोक्का रहेको जग्गा फुकुवा गरिपाऊँ।\n\n" +
      "रोक्का रहेको सम्पत्तिको विवरण: {{propertyDetails}}\nफुकुवा माग गरिएको अचल सम्पत्तिको विवरण: {{immovablePropertyDetails}}\n\nसंलग्न कागजात: रोक्का राखेको पत्रको प्रतिलिपि भए सो कागजात\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
];

async function main() {
  console.log("Seeding Batch 13 — High Court templates (first batch, 3 forms)...");

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

  console.log(`Batch 13 complete. ${created} new template(s) created. उच्च अदालत folder: 3/50+ started.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
