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
    title: "फाराम नं. १८ — मुद्दा फिर्ता गरिपाऊँ (उच्च अदालत)",
    category: HIGH_COURT,
    description: "दाबी त्यागी वा दाबीको प्रयोजन समाप्त भएकोले प्रस्तुत मुद्दा फिर्ता गरिपाऊँ भन्ने निवेदन।",
    fields: [...COMMON_HC_FIELDS, { key: "withdrawalReason", label: "मुद्दा फिर्ता लिनुको कारण", type: "text", required: true }],
    bodyTemplate:
      "श्री उच्च अदालत {{courtName}} मा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : मुद्दा फिर्ता गरिपाऊँ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :–\n\n" +
      "१. मैले/हामीले दायर गरेको फिरादपत्र/निवेदनपत्र/पुनरावेदनपत्र बमोजिमको दाबी त्यागी सो दाबी फिर्ता लिनको लागि/{{withdrawalReason}} भएको हुनाले प्रस्तुत मुद्दा मुलुकी देवानी कार्यविधि संहिता, २०७४ को दफा १९६ बमोजिम फिर्ता गरिपाउन यो निवेदन गरेको छु/छौं। मागबमोजिम मुद्दा फिर्ता गरिपाऊँ।\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ५ — बयान गराइपाऊँ (उच्च अदालत)",
    category: HIGH_COURT,
    description: "म्याद/पक्राउ पुर्जी तामेल भएपछि हाजिर भई बयान गराइपाऊँ भन्ने निवेदन।",
    fields: [...COMMON_HC_FIELDS, { key: "summonServedDate", label: "म्याद/पक्राउ पुर्जी तामेल मिति", type: "date", required: true }],
    bodyTemplate:
      "श्री उच्च अदालत {{courtName}} मा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : बयान गराइपाऊँ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु :–\n\n" +
      "१. उल्लिखित मुद्दामा सम्मानित अदालतबाट मेरा नाममा जारी भएको म्याद/पक्राउ पुर्जी मिति {{summonServedDate}} मा तामेल भएकाले म्यादभित्र/म्याद थामी/जारी भएको म्याद/पक्राउ पुर्जीबमोजिम हाजिर हुन आएको छु। मुलुकी देवानी कार्यविधि संहिता, २०७४ को दफा १७५/मुलुकी फौजदारी कार्यविधि संहिता, २०७४ को दफा ५२ र ऐ. दफा १२२ बमोजिम बयान गराई पाऊँ।\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ३६ — गुज्रेको म्याद थामिपाऊँ (उच्च अदालत)",
    category: HIGH_COURT,
    description: "काबुबाहिरको परिस्थितिले हाजिर हुन नसकी म्याद गुज्रन गएकोले म्याद थामिपाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_HC_FIELDS,
      { key: "summonServedDate", label: "म्याद तामेल मिति", type: "date", required: true },
      { key: "deadlineDate", label: "हाजिर हुनुपर्ने मिति", type: "date", required: true },
      { key: "lapseReason", label: "म्याद गुज्रनुको कारण", type: "textarea", required: true },
    ],
    bodyTemplate:
      "श्री उच्च अदालत {{courtName}} मा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : गुज्रेको म्याद थामिपाऊँ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :\n\n" +
      "1. उक्त मुद्दामा सम्मानित अदालतबाट म/हामीका नाममा जारी भएको म्याद मिति {{summonServedDate}} मा तामेल भई मिति {{deadlineDate}} सम्ममा हाजिर हुनुपर्नेमा मलाई/हामीलाई {{lapseReason}} कारणले काबुबाहिरको परिस्थिति परी अदालतमा हाजिर हुन नसकी सो म्याद गुज्रिन गएकोले संक्षिप्त कार्यविधि ऐन, २०२८ को दफा ८(१)/विशेष अदालत ऐन, २०५९ को दफा ११/मुलुकी फौजदारी कार्यविधि संहिता, २०७४ को दफा ५९(५) बमोजिम गुज्रेको म्याद थामिपाऊँ। प्रमाण यसैसाथ संलग्न गरेको छु।\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला/बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
];

async function main() {
  console.log("Seeding Batch 22 — High Court templates (3 more)...");

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

  console.log(`Batch 22 complete. ${created} new template(s) created. उच्च अदालत folder: 29/50+ done — more remain.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
