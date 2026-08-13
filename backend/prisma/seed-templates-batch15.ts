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
    title: "फाराम नं. २३ — फैसला/आदेश संशोधन गरिपाऊँ (उच्च अदालत)",
    category: HIGH_COURT,
    description: "फैसला/आदेशमा टाइप/लेखाइको त्रुटि सच्याउन संशोधन गरिपाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_HC_FIELDS,
      { key: "judgmentDate", label: "फैसला/आदेश मिति", type: "date", required: true },
      { key: "errorContent", label: "फैसला/आदेशमा भएको त्रुटिको बेहोरा", type: "text" },
      { key: "errorPageNo", label: "पाना नं.", type: "text" },
      { key: "errorLineNo", label: "हरफ", type: "text" },
      { key: "correctedContent", label: "संशोधन हुनुपर्ने बेहोरा", type: "textarea", required: true },
    ],
    bodyTemplate:
      "श्री उच्च अदालत {{courtName}} मा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : फैसला/आदेश संशोधन गरिपाऊँ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं:\n\n" +
      "१. उल्लिखित मुद्दा सम्मानित अदालतमा दायर भई मिति {{judgmentDate}} मा फैसला/आदेश भएको छ। सो फैसला/आदेशमा तपसिलमा उल्लेख भएअनुसारको टाइप/लेखाइको भूलबाट त्रुटि हुन गएको हुँदा सोको सट्टा तपसिलबमोजिमको बेहोरा कायम गर्ने गरी न्याय प्रशासन ऐन, २०७३ को दफा १८ र उच्च अदालत नियमावली, २०७३ को नियम ११५ बमोजिम संशोधन गरिपाऊँ।\n\n" +
      "त्रुटिको बेहोरा: {{errorContent}} | पाना नं.: {{errorPageNo}} | हरफ: {{errorLineNo}}\nसंशोधन हुनुपर्ने बेहोरा: {{correctedContent}}\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ४७ — जेथाको सट्टा नगद धरौटी दाखिला गरिपाऊँ (उच्च अदालत)",
    category: HIGH_COURT,
    description: "जेथा जमानत राखेकोमा माग भएको नगद धरौटी दाखिला गरी जेथा फुकुवा गरिपाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_HC_FIELDS,
      { key: "orderDate", label: "थुनछेक आदेश मिति", type: "date", required: true },
      { key: "orderedAmount", label: "आदेशित धरौटी रकम रु.", type: "text", required: true },
      { key: "depositedAmount", label: "दाखिला गरेको रकम रु.", type: "text", required: true },
      { key: "propertyDetails", label: "जेथा जमानत बापत रहेको सम्पत्तिको विवरण", type: "textarea", required: true },
    ],
    bodyTemplate:
      "श्री उच्च अदालत {{courtName}} मा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : जेथाको सट्टा नगद धरौटी दाखिला गरिपाऊँ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु :\n\n" +
      "१. उपर्युक्त मुद्दामा यस अदालतबाट मिति {{orderDate}} मा रु. {{orderedAmount}} धरौटी वा सो बराबरको जेथा जमानत लिने आदेश भएकोमा नगद दाखिला गर्न नसकेको हुँदा सोबापत तपसिलमा उल्लिखित सम्पत्ति जेथा जमानी राखेकोमा सोको सट्टा माग भएको रकम रु. {{depositedAmount}} यसै निवेदनसाथ दाखिला गरेको छु/छौं। धरौट तथा जमानत निर्देशिका, २०७५ को दफा २६(१)(२) बमोजिम नगद धरौटी लिई जेथा जमानतमा रहेको तपसिलको जग्गा फुकुवा गरिपाऊँ।\n\n" +
      "जेथा जमानतबापत रहेको सम्पत्तिको विवरण: {{propertyDetails}}\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. २४ — धरौट तारेख पाऊँ (उच्च अदालत)",
    category: HIGH_COURT,
    description: "पुनः इन्साफको लागि पठाइएको मुद्दाको सक्कल मिसिल प्राप्त नभएकोले धरौट तारेखमा रहन पाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_HC_FIELDS,
      { key: "originalCourt", label: "मुद्दा पठाउने अदालत", type: "text", required: true },
      { key: "assignedDate", label: "तारिख तोकिएको मिति", type: "date", required: true },
    ],
    bodyTemplate:
      "श्री उच्च अदालत {{courtName}} मा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : धरौट तारेख पाऊँ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौ :\n\n" +
      "१. उल्लिखित मुद्दा {{originalCourt}} अदालतबाट पुनः इन्साफको लागि/पुनरावेदन दर्ता भई सम्मानित अदालतमा पठाउने गरी फैसला/आदेश भई आज मिति {{assignedDate}} को तारिख तोकी हाजिर हुन जानु भनी पठाएकोमा उक्त मुद्दाको सक्कल मिसिल प्राप्त हुन नआएकाले मुलुकी देवानी कार्यविधि संहिता, २०७४ को दफा १३५ बमोजिम/मुलुकी फौजदारी कार्यविधि संहिता, २०७४ को दफा ६९ बमोजिम हाललाई धरौट तारेखमा रहन पाऊँ। तारिख पर्चाको प्रतिलिपि यसै साथ छ।\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
];

async function main() {
  console.log("Seeding Batch 15 — High Court templates (3 more)...");

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

  console.log(`Batch 15 complete. ${created} new template(s) created. उच्च अदालत folder: 9/50+ done — more remain.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
