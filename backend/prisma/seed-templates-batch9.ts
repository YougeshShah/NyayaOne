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
    title: "फाराम नं. १ — अधिकृत वारिसनामा प्रमाणित गरिपाऊँ (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "अधिकृत वारिस नियुक्ति गर्न चाहेकोले प्रमाणित गरिपाऊँ भन्ने निवेदन।",
    fields: [
      { key: "courtName", label: "अदालतको नाम", type: "text", autoFillSource: "court.name" },
      { key: "petitionerName", label: "निवेदकको नाम, थर", type: "text", autoFillSource: "client.fullName", required: true },
      { key: "petitionerAge", label: "निवेदकको उमेर", type: "text", required: true },
      { key: "petitionerAddress", label: "निवेदकको ठेगाना", type: "text", autoFillSource: "client.address", required: true },
      { key: "petitionerCitizenshipNo", label: "निवेदकको नागरिकता नं. र जारी जिल्ला/मिति", type: "text", autoFillSource: "client.identificationNo" },
      { key: "attorneyName", label: "अधिकृत वारिस हुने व्यक्तिको नाम, थर", type: "text", required: true },
      { key: "attorneyAge", label: "वारिस हुनेको उमेर", type: "text" },
      { key: "attorneyAddress", label: "वारिस हुनेको ठेगाना", type: "text" },
      { key: "purpose", label: "अधिकृत वारिसनामा दिने विषय", type: "textarea", required: true },
      { key: "submissionDate", label: "मिति", type: "date", autoFillSource: "today" },
    ],
    bodyTemplate:
      "अनुसूची ४५ (मुलुकी देवानी कार्यविधि नियमावली, २०७५ को नियम ६८ को उपनियम (१) सँग सम्बन्धित)\n\nश्री {{courtName}} जिल्ला अदालतमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : अधिकृत वारिसनामा प्रमाणित गरिपाऊँ ।\n\n{{petitionerName}} — निवेदक\n\n" +
      "म निवेदक {{petitionerName}} ले देहायको {{attorneyName}} व्यक्तिलाई देहायको {{purpose}} विषयमा अधिकृत वारिस नियुक्ति गर्न चाहेकोले मुलुकी देवानी कार्यविधि संहिता, २०७४ को दफा १५३ को बमोजिम निम्न विवरणसहित निवेदन गर्दछु। अधिकृत वारिसनामाको कागज दुई प्रति र लाग्ने दस्तुर रु. ५००।- यसैसाथ संलग्न छ।\n\n" +
      "(१) अधिकृत वारिसनामा दिनेको: उमेर {{petitionerAge}}, ठेगाना {{petitionerAddress}}, नागरिकता नं.: {{petitionerCitizenshipNo}}\n\n" +
      "(२) अधिकृत वारिस हुनेको: नाम {{attorneyName}}, उमेर {{attorneyAge}}, ठेगाना {{attorneyAddress}}\n\n" +
      "(३) अधिकृत वारिसनामा दिने विषयः {{purpose}}\n\n" +
      "३. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ३७ — दर्ताद्वारा विवाह गराइपाऊँ (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "मुलुकी देवानी संहिता दफा ७७ बमोजिम दर्ताद्वारा विवाह गर्न चाहने जोडीको निवेदन।",
    fields: [
      { key: "courtName", label: "अदालतको नाम", type: "text", autoFillSource: "court.name" },
      { key: "groomName", label: "पुरुष निवेदकको नाम, थर", type: "text", autoFillSource: "client.fullName", required: true },
      { key: "groomAddress", label: "पुरुषको स्थायी ठेगाना", type: "text", autoFillSource: "client.address" },
      { key: "brideName", label: "महिला निवेदकको नाम, थर", type: "text", required: true },
      { key: "brideAddress", label: "महिलाको स्थायी ठेगाना", type: "text" },
      { key: "witnessDetails", label: "साक्षीको नाम, थर, उमेर, ठेगाना (दुई जना)", type: "textarea", required: true },
      { key: "submissionDate", label: "मिति", type: "date", autoFillSource: "today" },
    ],
    bodyTemplate:
      "अनुसूची-२७ (मुलुकी देवानी कार्यविधि नियमावली, २०७५ नियम ६२ को उपनियम (१) सँग सम्बन्धित)\n\nश्री {{courtName}} जिल्ला अदालतमा पेस गरेको\n\nनिवेदन पत्र\n\nविषयः दर्ताद्वारा विवाह गराइपाऊँ।\n\n" +
      "हामी निवेदकहरू {{groomName}} (ठेगाना: {{groomAddress}}) र {{brideName}} (ठेगाना: {{brideAddress}}) लाई मुलुकी देवानी संहिता, २०७४ को दफा ७७ बमोजिम दर्ताद्वारा विवाह गर्न इच्छा भएको र प्रचलित कानूनबमोजिम विवाह गर्नका लागि योग्य रहेको हुँदा निम्न विवरण र घोषणासहित दर्ताद्वारा विवाहका लागि निवेदन गर्दछौं। लाग्ने दस्तुर रु ५००।- यसैसाथ संलग्न छ।\n\n" +
      "हामी निवेदकहरू निम्नलिखित घोषणा गर्दछौं:–\n१. कानूनबमोजिम हाम्रो विवाह गर्ने उमेर पुगेको छ।\n२. हामीबिच कायम हुने सम्बन्ध कानूनले रोक लगाएको हाडनाताभित्र पर्दैन।\n३. विवाह गर्न हाम्रो मन्जुरी रहेको छ।\n४. हामीले एक आपसमा झुक्याई विवाह गर्न लागेका छैनौं।\n५. हाम्रो यसअघि विवाह भएको छैन।\n\n" +
      "साक्षी विवरण: {{witnessDetails}}\n\n" +
      "यस निवेदनपत्रको बेहोरा ठिक साँचो छ, झुट्टा बेहोरा लेखिएको ठहरे कानूनबमोजिम सजाय सहुँला बुझाउँला।\n\nनिवेदकहरू\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. १६ — निःशुल्क कानूनी सहायता उपलब्ध गराइपाऊँ (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "कानून व्यवसायी राख्न असमर्थ भएकोले वैतनिक कानून व्यवसायीमार्फत निःशुल्क कानूनी सहायता उपलब्ध गराई पाउने निवेदन।",
    fields: [
      { key: "courtName", label: "अदालतको नाम", type: "text", autoFillSource: "court.name" },
      { key: "petitionerFatherName", label: "निवेदकको बाबु/पति को नाम", type: "text", required: true },
      { key: "petitionerDistrict", label: "निवेदकको जिल्ला", type: "text", required: true },
      { key: "petitionerMunicipality", label: "न.पा./गा.पा.", type: "text", required: true },
      { key: "petitionerWardNo", label: "वडा नं.", type: "text", required: true },
      { key: "petitionerAge", label: "निवेदकको उमेर", type: "text", required: true },
      { key: "petitionerName", label: "निवेदकको नाम", type: "text", autoFillSource: "client.fullName", required: true },
      { key: "respondentName", label: "विपक्षीको नाम", type: "text", autoFillSource: "case.opposingParty" },
      { key: "caseNo", label: "मुद्दा नं.", type: "text", autoFillSource: "case.caseNumber" },
      { key: "caseSubject", label: "मुद्दा", type: "text", autoFillSource: "case.category" },
      { key: "attachedDoc1", label: "संलग्न कागजात (क)", type: "text" },
      { key: "attachedDoc2", label: "संलग्न कागजात (ख)", type: "text" },
      { key: "submissionDate", label: "मिति", type: "date", autoFillSource: "today" },
    ],
    bodyTemplate:
      "श्री {{courtName}} जिल्ला अदालतमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : निःशुल्क कानूनी सहायता उपलब्ध गराइपाऊँ ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n{{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "म/हामी निम्नानुसार निवेदन गर्दछु/गर्दछौं :–\n\n" +
      "१. म/हामी असहाय/आर्थिकरूपमा विपन्न/अशक्त/थुनुवा/नाबालिग भई कानून व्यवसायी राख्न असमर्थ भएकाले वैतनिक कानून व्यवसायी/अन्य कानून व्यवसायीमार्फत कानूनी सहायता (कानूनी लिखत तयार गर्ने/बहस पैरवी गरिदिने) उपलब्ध गराई पाउन यो निवेदन गरेको छु/छौं। जिल्ला अदालत नियमावली, २०७५ को नियम १०२ बमोजिम वैतनिक कानून व्यवसायीमार्फत निःशुल्क कानूनी सहायता उपलब्ध गराइपाऊँ।\n\nसंलग्न कागजात: (क) {{attachedDoc1}} (ख) {{attachedDoc2}}\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. २७ — फैसला/आदेश संशोधन गरिपाऊँ (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "फैसला/आदेशमा टाइप/लेखाइको त्रुटि सच्याउन संशोधन गरिपाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_DC_FIELDS,
      { key: "judgmentDate", label: "फैसला/आदेश मिति", type: "date", required: true },
      { key: "errorContent", label: "फैसला/आदेशमा भएको त्रुटिको बेहोरा", type: "text" },
      { key: "errorPageNo", label: "पाना नं.", type: "text" },
      { key: "errorLineNo", label: "हरफ", type: "text" },
      { key: "correctedContent", label: "संशोधन हुनुपर्ने बेहोरा", type: "textarea", required: true },
    ],
    bodyTemplate:
      "श्री {{courtName}} जिल्ला अदालतमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : फैसला/आदेश संशोधन गरिपाऊँ ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं:\n\n" +
      "१. उल्लिखित मुद्दा सम्मानित अदालतमा दायर भई मिति {{judgmentDate}} मा फैसला/आदेश भएको छ। सो फैसला/आदेशमा तपसिलमा उल्लेख भएअनुसारको टाइप/लेखाइको भुलबाट त्रुटि हुन गएको हुँदा सोको सट्टा तपसिलबमोजिमको बेहोरा कायम गर्ने गरी न्याय प्रशासन ऐन, २०७३ को दफा १८ र जिल्ला अदालत नियमावली, २०७५ को नियम ७१ बमोजिम संशोधन गरिपाऊँ।\n\nत्रुटिको बेहोरा: {{errorContent}} | पाना नं.: {{errorPageNo}} | हरफ: {{errorLineNo}}\nसंशोधन हुनुपर्ने बेहोरा: {{correctedContent}}\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ५३ — हाजिर हुने अर्को म्याद पाऊँ (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "समाह्वान/म्याद तामेल र हाजिर हुने मितिबीच १५ दिन नपुगेकोले अर्को म्याद तोकिपाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_DC_FIELDS,
      { key: "requiredDate", label: "हाजिर हुनु भनिएको मिति", type: "date", required: true },
      { key: "servedDate", label: "समाह्वान तामेल भएको मिति", type: "date", required: true },
      { key: "daysBeforeServed", label: "हाजिर हुने दिनभन्दा कति दिन अगाडि तामेल भयो", type: "text" },
      { key: "reason", label: "हाजिर हुन नसक्ने कारण", type: "textarea", required: true },
    ],
    bodyTemplate:
      "श्री {{courtName}} जिल्ला अदालतमा चढाएको\n\nनिवेदन पत्र\n\nविषय : हाजिर हुने अर्को म्याद पाऊँ ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखि निम्नानुसार निवेदन गर्दछु/गर्दछौं :–\n\n" +
      "1. उल्लिखित मुद्दामा म/हामीलाई मिति {{requiredDate}} गते हाजिर हुनु भनी समाह्वान जारी भएको र उक्त समाह्वान मिति {{servedDate}} मा तामेल हुँदा हाजिर हुन तोकिएको म्यादभन्दा पन्ध्र दिनअगावै तामेल नभएको र हाजिर हुने दिनभन्दा {{daysBeforeServed}} दिनअगाडि तामेल भएको हुनाले {{reason}} कारणले उक्त मितिमा हाजिर हुन नसक्ने हुँदा समाह्वान तामेल भएको मितिले पन्ध्र दिनभित्र उपस्थित हुन मुलुकी फौजदारी कार्यविधि संहिता, २०७४ को दफा ५९(३) बमोजिम अर्को म्याद तोकिपाऊँ।\n2. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
];

async function main() {
  console.log("Seeding Batch 9 — District Court templates (5 more)...");

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

  console.log(`Batch 9 complete. ${created} new template(s) created. जिल्ला अदालत folder: 54/73 done — more remain.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
