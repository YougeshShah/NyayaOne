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
    title: "फाराम नं. १९ — मुद्दा मुलतबीबाट जगाइपाऊँ (उच्च अदालत)",
    category: HIGH_COURT,
    description: "मुलतबीमा राखिएको कारण समाप्त भएकोले मुद्दा जगाई कारबाही अगाडि बढाइपाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_HC_FIELDS,
      { key: "suspensionReason", label: "मुलतबी हुनुको कारण", type: "textarea", required: true },
      { key: "suspensionOrderDate", label: "मुलतबी आदेशको मिति", type: "date", required: true },
      { key: "attachedDoc1", label: "संलग्न कागजात (क)", type: "text" },
      { key: "attachedDoc2", label: "संलग्न कागजात (ख)", type: "text" },
    ],
    bodyTemplate:
      "श्री उच्च अदालत {{courtName}} मा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : मुद्दा मुलतबीबाट जगाइपाऊँ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं:–\n\n" +
      "१. प्रस्तुत मुद्दा {{suspensionReason}} कारणबाट सम्मानित अदालतको मिति {{suspensionOrderDate}} को आदेशानुसार मुलतबीमा रहेकोमा उक्त प्रयोजन समाप्त भइसकेकोले मुलुकी देवानी कार्यविधि संहिता, २०७४ को दफा २०२ बमोजिम मुलतबीबाट जगाई कारबाही गरिपाउन सम्बन्धित कागजात संलग्न राखी निवेदन गर्दछु/गर्दछौँ। निवेदन मागबमोजिम मुद्दा मुलतबीबाट जगाइपाऊँ।\n\n" +
      "संलग्न कागजात: (क) {{attachedDoc1}} (ख) {{attachedDoc2}}\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ५१ — बैंक जमानत दिइएको (उच्च अदालत)",
    category: HIGH_COURT,
    description: "फैसलाबमोजिम कैद/जरिवाना बापत बैंक जमानत राखी पुनरावेदन गर्ने सुविधाको लागि बैंक जमानत दाखिला गर्ने निवेदन।",
    fields: [
      ...COMMON_HC_FIELDS,
      { key: "orderDate", label: "थुनछेक आदेश/फैसला मिति", type: "date", required: true },
      { key: "judgeName", label: "माननीय न्यायाधीशको नाम", type: "text", autoFillSource: "case.judge" },
      { key: "sentenceDetails", label: "भएको सजाय (कैद/जरिवाना)", type: "text", required: true },
      { key: "bankName", label: "बैंकको नाम र शाखा", type: "text", required: true },
      { key: "guaranteeAmount", label: "बैंक जमानत रकम रु.", type: "text", required: true },
      { key: "guaranteeIssueDate", label: "बैंक जमानत जारी मिति", type: "date", required: true },
      { key: "validUntilDate", label: "जमानत मान्य रहने मिति (सम्म)", type: "date" },
    ],
    bodyTemplate:
      "अनुसूची-३ (धरौट तथा जमानत निर्देशिका, २०७५ को दफा ११ सँग सम्बन्धित)\n\nश्री उच्च अदालत {{courtName}} मा पेस गरेको\n\nनिवेदनपत्र\n\nविषयः बैंक जमानत दिइएको।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दाः\n\n" +
      "म निवेदक रु.१०।- दस्तुर साथै राखी निम्न बेहोराको निवेदन गर्दछुः-\n\n" +
      "1. उल्लिखित मुद्दामा मिति {{orderDate}} मा थुनछेकको आदेश हुँदा माननीय न्यायाधीश श्री {{judgeName}} को इजलासबाट मलाई धरौट वा जमानत माग्ने गरी आदेश भएकोले/अदालतको फैसलाबमोजिम मलाई भएको {{sentenceDetails}} बापत धरौट राखी पुनरावेदन दर्ता गर्न पाउने सुविधा प्राप्त गरेकोले त्यसबापतको नगद रकम {{bankName}} बैंकले मिति {{validUntilDate}} सम्मको लागि मिति {{guaranteeIssueDate}} मा जारी गरेको बैंक जमानत रु. {{guaranteeAmount}} यसै निवेदनसाथ दाखिला गरेको छु। उक्त बैंक जमानत अदालतको आदेशानुसारको अवधिसम्म नवीकरण गराउने छु। उक्त बैंक जमानत बुझी लिई कानूनबमोजिम तारिखमा रहन/पुनरावेदन दर्ता गर्न पाऊँ। बैंक जमानतको सक्कल प्रति र सोसम्बन्धी सम्झौताको प्रतिलिपि यसैसाथ संलग्न गरेको छु।\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ४१ — मुद्दा मुलतबीमा राखिपाऊँ (उच्च अदालत)",
    category: HIGH_COURT,
    description: "अन्तरप्रभावी अर्को मुद्दा फैसला नहुन्जेल हालको मुद्दा मुलतबीमा राख्न दिने निवेदन।",
    fields: [
      ...COMMON_HC_FIELDS,
      { key: "relatedCourt", label: "सम्बन्धित अदालत", type: "text", required: true },
      { key: "relatedPlaintiff", label: "सो मुद्दाका वादी", type: "text" },
      { key: "relatedDefendant", label: "सो मुद्दाका प्रतिवादी", type: "text" },
      { key: "relatedCaseYear", label: "सो मुद्दा दर्ता साल", type: "text" },
      { key: "relatedCaseNo", label: "सो मुद्दाको मु.नं.", type: "text" },
      { key: "relatedCaseSubject", label: "सो मुद्दाको विषय", type: "text" },
      { key: "otherReason", label: "अन्य कारण (ख)", type: "textarea" },
    ],
    bodyTemplate:
      "श्री उच्च अदालत {{courtName}} मा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : मुद्दा मुलतबीमा राखिपाऊँ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :–\n\n" +
      "१. प्रस्तुत मुद्दा सम्मानित अदालतमा दायर भै कारबाहीयुक्त अवस्थामा छ। निम्न कारण परेकोले उल्लिखित मुद्दा मुलुकी फौजदारी कार्यविधि संहिता, २०७४ को दफा ९७(१) बमोजिम मुलतबीमा राखिपाऊँ।\n\n" +
      "मुलतबी रहनुपर्ने कारण\n(क) {{relatedCourt}} अदालतमा कारबाहीयुक्त अवस्थामा रहेको वादी {{relatedPlaintiff}} प्रतिवादी {{relatedDefendant}} भएको {{relatedCaseYear}} सालको मु.नं. {{relatedCaseNo}} को {{relatedCaseSubject}} मुद्दा प्रस्तुत मुद्दासँग अन्तरप्रभावी रहेकाले सो मुद्दा फैसला नहुन्जेलसम्मका लागि\n(ख) {{otherReason}}\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
];

async function main() {
  console.log("Seeding Batch 18 — High Court templates (3 more)...");

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

  console.log(`Batch 18 complete. ${created} new template(s) created. उच्च अदालत folder: 18/50+ done — more remain.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
