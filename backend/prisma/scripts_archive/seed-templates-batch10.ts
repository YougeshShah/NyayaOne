import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DISTRICT_COURT = "सेवाग्राहीले जिल्ला अदालतमा पेस गर्ने निवेदनका ढाँचाहरू";

const COMMON_DC_FIELDS = [
  { key: "courtName", label: "जिल्ला अदालतको नाम", type: "text", autoFillSource: "court.name" },
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
    title: "फाराम नं. ३१ — थुनामा परेको जानकारी बारे (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "अर्को मुद्दामा थुनामा परेकोले तारिखमा हाजिर हुन नसक्ने जानकारी दिने निवेदन।",
    fields: [
      ...COMMON_DC_FIELDS,
      { key: "hearingDate", label: "तारिख तोकिएको मिति", type: "date", required: true },
      { key: "otherCaseDetails", label: "जुन मुद्दामा थुनामा परेको हो सो को विवरण", type: "text", required: true },
      { key: "custodyStartDate", label: "थुनामा परेको मिति", type: "date", required: true },
      { key: "representativeName", label: "जानकारी दिने व्यक्ति (परिवार/कानून व्यवसायी/वारिस)", type: "text" },
    ],
    bodyTemplate:
      "श्री {{courtName}} जिल्ला अदालतमा चढाएको\n\nनिवेदन पत्र\n\nविषय : थुनामा परेको जानकारी बारे ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखि निम्नानुसार निवेदन गर्दछु/गर्दछौं :–\n\n" +
      "1. उल्लिखित मुद्दामा म/हामीलाई मिति {{hearingDate}} मा तारिख तोकिएकोमा म/हामी {{otherCaseDetails}} मुद्दामा मिति {{custodyStartDate}} देखि थुनामा परेको हुनाले तारिखमा हाजिर हुन नसकेको हुँदा म/हामी/एकासगोलको परिवार/कानून व्यवसायी/वारिस {{representativeName}} बाट मुलुकी देवानी कार्यविधि संहिता, २०७४ को दफा १४० बमोजिम थुनामा परेको बेहोरा अनुरोध छ।\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ४२ — गुठी सञ्चालक नियुक्त गरिपाऊँ (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "गुठीको सञ्चालक पद रिक्त रहेकोले सञ्चालक नियुक्ति गरिपाऊँ भन्ने निवेदन।",
    fields: [
      { key: "courtName", label: "अदालतको नाम", type: "text", autoFillSource: "court.name" },
      { key: "petitionerName", label: "निवेदकको नाम, थर", type: "text", autoFillSource: "client.fullName", required: true },
      { key: "petitionerAge", label: "निवेदकको उमेर", type: "text", required: true },
      { key: "petitionerAddress", label: "निवेदकको ठेगाना", type: "text", autoFillSource: "client.address", required: true },
      { key: "petitionerParents", label: "निवेदकका बाबु, आमाको नाम", type: "text" },
      { key: "petitionerGrandparents", label: "निवेदकका बाजे, बज्यैको नाम", type: "text" },
      { key: "guthiName", label: "गुठीको नाम", type: "text", required: true },
      { key: "vacancyReason", label: "सञ्चालक रिक्त रहेको मिति र कारण", type: "textarea", required: true },
      { key: "candidatesList", label: "सञ्चालक हुन सम्भाव्य व्यक्तिहरूको नाम, थर (सूची)", type: "textarea", required: true },
      { key: "supportingDocs", label: "बेहोरा पुष्टि गर्ने संलग्न कागज प्रमाण", type: "text" },
      { key: "submissionDate", label: "मिति", type: "date", autoFillSource: "today" },
    ],
    bodyTemplate:
      "अनुसूची-४३ (मुलुकी देवानी कार्यविधि नियमावली, २०७५ नियम ६७ को उपनियम (१) सँग सम्बन्धित)\n\nश्री {{courtName}} जिल्ला अदालतमा पेस गरेको\n\nनिवेदन पत्र\n\nविषयः गुठी सञ्चालक नियुक्त गरिपाऊँ।\n\n" +
      "{{petitionerName}} — निवेदक, उमेर {{petitionerAge}}, ठेगाना {{petitionerAddress}}\n\n" +
      "{{guthiName}} गुठीको सञ्चालक पद रिक्त रहेको र उक्त सञ्चालकको पद मुलुकी देवानी संहिता, २०७४ को दफा ३२८ को उपदफा (२) बमोजिम पूर्ति हुन नसकेकोले सोही ऐनको उपदफा (३) बमोजिम उक्त रिक्त सञ्चालकको पदपूर्ति गरी पाउन निम्न विवरणसहित निवेदन गर्दछु। लाग्ने दस्तुर रु. ५००।- यसैसाथ संलग्न छ।\n\n" +
      "(१) निवेदकः बाबु, आमाको नामः {{petitionerParents}} | बाजे, बज्यैको नामः {{petitionerGrandparents}}\n\n" +
      "(२) सञ्चालक रिक्त रहेको मिति र कारणः {{vacancyReason}}\n\n" +
      "(३) सञ्चालक हुन सम्भाव्य व्यक्तिहरूको नाम थरः {{candidatesList}} (निवेदनसाथ सबै सम्भाव्य व्यक्तिहरूको वैयक्तिक विवरण संलग्न हुनुपर्नेछ)\n\n" +
      "(४) बेहोरा पुष्टि गर्ने संलग्न कागज प्रमाणः {{supportingDocs}} (स्थानीय तहको पत्र वा सिफारिश, २।२ प्रति फोटो)\n\n" +
      "यस निवेदनपत्रको बेहोरा ठिक साँचो छ, झुट्टा बेहोरा लेखिएको ठहरे कानूनबमोजिम सजाय सहुँला बुझाउँला।\n\nनिवेदकको दस्तखत\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. २३ — मुद्दा मुलतबीबाट जगाइपाऊँ (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "मुलतबीमा राखिएको कारण समाप्त भएकोले मुद्दा जगाई कारबाही अगाडि बढाइपाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_DC_FIELDS,
      { key: "suspensionReason", label: "मुलतबी हुनुको कारण", type: "textarea", required: true },
      { key: "suspensionOrderDate", label: "मुलतबी आदेशको मिति", type: "date", required: true },
      { key: "attachedDoc1", label: "संलग्न कागजात (क)", type: "text" },
      { key: "attachedDoc2", label: "संलग्न कागजात (ख)", type: "text" },
    ],
    bodyTemplate:
      "श्री {{courtName}} जिल्ला अदालतमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : मुद्दा मुलतबीबाट जगाइपाऊँ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौँ :–\n\n" +
      "१. प्रस्तुत मुद्दा {{suspensionReason}} कारणबाट सम्मानित अदालतको मिति {{suspensionOrderDate}} को आदेशानुसार मुलतबीमा रहेकोमा उक्त प्रयोजन समाप्त भइसकेकोले मुलुकी देवानी कार्यविधि संहिता, २०७४ को दफा २०२ बमोजिम मुलतबीबाट जगाई कारबाही गरिपाउन सम्बन्धित कागजात संलग्न राखी निवेदन गर्दछु/गर्दछौँ। निवेदन मागबमोजिम मुद्दा मुलतबीबाट जगाइपाऊँ।\n\n" +
      "संलग्न कागजात: (क) {{attachedDoc1}} (ख) {{attachedDoc2}}\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
];

async function main() {
  console.log("Seeding Batch 10 — District Court templates (3 more)...");

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

  console.log(`Batch 10 complete. ${created} new template(s) created. जिल्ला अदालत folder: 57/73 done — more remain.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
