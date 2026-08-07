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
    title: "फाराम नं. ७ — नक्कल निवेदन (उच्च अदालत)",
    category: HIGH_COURT,
    description: "मुद्दाका लिखत/प्रमाणको नक्कल सारी लिन पाऊँ भन्ने निवेदन।",
    fields: [
      { key: "courtName", label: "अदालतको नाम", type: "text", autoFillSource: "court.name" },
      { key: "petitionerName", label: "निवेदकको नाम", type: "text", autoFillSource: "client.fullName", required: true },
      { key: "respondentName", label: "अर्को पक्ष (वादी/प्रतिवादी)", type: "text", autoFillSource: "case.opposingParty" },
      { key: "caseNo", label: "मुद्दा नं.", type: "text", autoFillSource: "case.caseNumber" },
      { key: "caseSubject", label: "मुद्दा", type: "text", autoFillSource: "case.category" },
      { key: "requestedDocuments", label: "नक्कल माग गरेका लिखत/प्रमाण", type: "textarea", required: true },
      { key: "submissionDate", label: "मिति", type: "date", autoFillSource: "today" },
    ],
    bodyTemplate:
      "श्री उच्च अदालत {{courtName}} मा पेस गरेको\n\nनक्कलको निवेदन पत्र\n\nमुद्दा नं. {{caseNo}} — मुद्दाः {{caseSubject}}\n\n{{petitionerName}} — निवेदक/वादी/प्रतिवादी\n\nविरुद्ध\n\n{{respondentName}} — वादी/प्रतिवादी\n\n" +
      "म निवेदक मुलुकी देवानी कार्यविधि संहिता, २०७४ को दफा ४६/मुलुकी फौजदारी कार्यविधि संहिता, २०७४ को दफा १७५ बमोजिम निम्नबमोजिमको लिखत/प्रमाणको नक्कल अदालतको/आफ्नै तर्फबाट सारी लिन पाउँ भनी नियमबमोजिमको दस्तुर साथै राखी निवेदन गर्दछु :\n\n" +
      "नक्कल माग गरेका लिखत/प्रमाण: {{requestedDocuments}}\n\nयसमा लेखिएको बेहोरा ठिक साँचो छ झुट्टा ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ५३ — कारणी उपस्थित गराएको (उच्च अदालत)",
    category: HIGH_COURT,
    description: "तारिख तोकिएबमोजिम आफ्नो पक्ष/कारणी उपस्थित गराएको जनाउने निवेदन।",
    fields: [
      ...COMMON_HC_FIELDS,
      { key: "hearingDate", label: "उपस्थित गराउनु भनिएको मिति", type: "date" },
      { key: "presentedPersonName", label: "उपस्थित गराइएको पक्ष/कारणीको नाम", type: "text", required: true },
    ],
    bodyTemplate:
      "श्री उच्च अदालत {{courtName}} मा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : कारणी उपस्थित गराएको।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}।\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु :–\n\n" +
      "१. उल्लिखित मुद्दामा मुलुकी देवानी कार्यविधि संहिता, २०७४ को दफा १७२(६) बमोजिम/छलफलका निमित्त आज मिति {{hearingDate}} गते कारणीलाई उपस्थित गराउनु भनी तारेख तोकी पाएबमोजिम यसै निवेदनसाथ आफ्नो पक्ष/कारणी {{presentedPersonName}} लाई उपस्थित गराएको छु। कानूनबमोजिम गरिपाऊँ।\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ६ — हाजिर हुन पाऊँ (उच्च अदालत)",
    category: HIGH_COURT,
    description: "म्याद तामेल भएपछि म्यादभित्रै बयानका लागि हाजिर भई बयान गराइपाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_HC_FIELDS,
      { key: "summonServedDate", label: "म्याद तामेल मिति", type: "date", required: true },
    ],
    bodyTemplate:
      "श्री उच्च अदालत {{courtName}} मा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : हाजिर हुन पाऊँ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु:\n\n" +
      "१. उक्त मुद्दामा मेरा नाममा मुलुकी देवानी कार्यविधि संहिता, २०७४ को दफा १२३ बमोजिम जारी भएको म्याद मिति {{summonServedDate}} मा तामेल भएकाले तामेल भएका मितिले म्यादभित्रै बयानका लागि हाजिर हुन आएको छु। बयान गराई पाऊँ।\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
];

async function main() {
  console.log("Seeding Batch 17 — High Court templates (3 more)...");

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

  console.log(`Batch 17 complete. ${created} new template(s) created. उच्च अदालत folder: 15/50+ done — more remain.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
