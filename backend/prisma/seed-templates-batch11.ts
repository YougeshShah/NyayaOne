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
    title: "फाराम नं. ६९ — जेथाको सट्टा नगद धरौटी दाखिला गरिपाऊँ (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "जेथा जमानत राखेकोमा माग भएको नगद धरौटी दाखिला गरी जेथा फुकुवा गरिपाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_DC_FIELDS,
      { key: "orderDate", label: "थुनछेक आदेश मिति", type: "date", required: true },
      { key: "orderedAmount", label: "आदेशित धरौटी रकम रु.", type: "text", required: true },
      { key: "depositedAmount", label: "दाखिला गरेको रकम रु.", type: "text", required: true },
      { key: "propertyDetails", label: "जेथा जमानत बापत रहेको सम्पत्तिको विवरण", type: "textarea", required: true },
    ],
    bodyTemplate:
      "श्री {{courtName}} जिल्ला अदालतमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : जेथाको सट्टा नगद धरौटी दाखिला गरिपाऊँ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु :\n\n" +
      "१. उपर्युक्त मुद्दामा यस अदालतबाट मिति {{orderDate}} मा रु. {{orderedAmount}} धरौटी वा सो बराबरको जेथा जमानत लिने आदेश भएकोमा नगद दाखिला गर्न नसकेको हुँदा सोबापत तपसिलमा उल्लिखित सम्पत्ति जेथा जमानी राखेकोमा सोको सट्टा माग भएको रकम रु. {{depositedAmount}} यसै निवेदनसाथ दाखिला गरेको छु/छौं। धरौट तथा जमानत निर्देशिका, २०७५ को दफा २६(१)(२) बमोजिम नगद धरौटी लिई जेथा जमानतमा रहेको तपसिलको जग्गा फुकुवा गरिपाऊँ।\n\n" +
      "जेथा जमानतबापत रहेको सम्पत्तिको विवरण: {{propertyDetails}}\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ४४ — शारीरिक जाँच गरिपाऊँ (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "हिरासतमा रहँदा शारीरिक स्वास्थ्य समस्याको कारण शारीरिक जाँच गराई पाउने निवेदन।",
    fields: [
      ...COMMON_DC_FIELDS,
      { key: "custodyStartDate", label: "हिरासतमा परेको मिति", type: "date", required: true },
      { key: "healthReason", label: "जाँच गराउनुपर्ने कारण", type: "textarea", required: true },
    ],
    bodyTemplate:
      "श्री {{courtName}} जिल्ला अदालतमा चढाएको\n\nनिवेदन पत्र\n\nविषय : शारीरिक जाँच गरिपाऊँ ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :–\n\n" +
      "1. उल्लिखित मुद्दा म/हामी मिति {{custodyStartDate}} गतेदेखि अनुसन्धानको क्रममा पक्राउ परी प्रहरी हिरासतमा रहेका छु/छौं। हिरासतमा रहँदा म/हामीलाई {{healthReason}} हुनाले मुलुकी फौजदारी कार्यविधि संहिता, २०७४ को दफा १४(५) बमोजिम शारीरिक जाँच गरिपाऊँ।\n2. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ३८ — संरक्षक प्रमाणित गरिपाऊँ (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "असक्षम/अर्धसक्षम व्यक्तिको संरक्षक प्रमाणित गरिपाऊँ भन्ने निवेदन।",
    fields: [
      { key: "courtName", label: "अदालतको नाम", type: "text", autoFillSource: "court.name" },
      { key: "petitionerName", label: "निवेदकको नाम, थर", type: "text", autoFillSource: "client.fullName", required: true },
      { key: "petitionerAge", label: "निवेदकको उमेर", type: "text", required: true },
      { key: "petitionerAddress", label: "निवेदकको ठेगाना", type: "text", autoFillSource: "client.address", required: true },
      { key: "relationToIncapable", label: "असक्षम/अर्धसक्षम व्यक्तिसँगको नाता", type: "text" },
      { key: "petitionerParents", label: "निवेदकका बाबु, आमाको नाम", type: "text" },
      { key: "incapablePersonName", label: "असक्षम/अर्धसक्षम व्यक्तिको नाम, थर", type: "text", required: true },
      { key: "incapablePersonAge", label: "निजको उमेर", type: "text" },
      { key: "incapablePersonAddress", label: "निजको ठेगाना", type: "text" },
      { key: "priorityReason", label: "प्राथमिकताक्रमको व्यक्ति संरक्षक नभई निवेदक संरक्षक हुनुपर्ने कारण", type: "textarea", required: true },
      { key: "submissionDate", label: "मिति", type: "date", autoFillSource: "today" },
    ],
    bodyTemplate:
      "अनुसूची-३१ (मुलुकी देवानी कार्यविधि नियमावली, २०७५ नियम ६३ को उपनियम (१) सँग सम्बन्धित)\n\nश्री {{courtName}} जिल्ला अदालतमा पेस गरेको\n\nनिवेदन पत्र\n\nविषयः संरक्षक प्रमाणित गरिपाऊँ।\n\n" +
      "{{petitionerName}} — निवेदक, उमेर {{petitionerAge}}, ठेगाना {{petitionerAddress}}\n\n" +
      "मुलुकी देवानी संहिता, २०७४ को दफा १३६/दफा १३७ बमोजिम असक्षम/अर्धसक्षम व्यक्तिको संरक्षक प्रमाणित गरिपाउँ भनी निम्न विवरणसहित निवेदन गर्दछु। लाग्ने दस्तुर रु. ५००।- यसैसाथ संलग्न छ।\n\n" +
      "(१) निवेदकको नाता (असक्षम व्यक्तिसँग): {{relationToIncapable}} | बाबु, आमाको नामः {{petitionerParents}}\n\n" +
      "(२) असक्षम/अर्धसक्षम व्यक्तिः {{incapablePersonName}}, उमेर {{incapablePersonAge}}, ठेगाना {{incapablePersonAddress}}\n\n" +
      "(३) प्राथमिकताक्रमको व्यक्ति संरक्षक नभई निवेदक संरक्षक हुनुपर्ने कारण र बेहोराः {{priorityReason}}\n\n" +
      "(४) बेहोरा पुष्टि गर्ने संलग्न कागज प्रमाणः निवेदकको परिचय खुल्ने नागरिकता, संरक्षकत्वमा रहने व्यक्तिको परिचय खुल्ने जन्मदर्ता, असक्षम/अर्धसक्षम भएको पुष्टि गर्ने कागज, स्थानीय तहको सिफारिस, संरक्षक रोजिएको लिखत, २।२ प्रति फोटो\n\n" +
      "यस निवेदनपत्रको बेहोरा ठिक साँचो छ, झुट्टा बेहोरा लेखिएको ठहरे कानूनबमोजिम सजाय सहुँला बुझाउँला।\n\nनिवेदकको दस्तखत\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ३३ — सम्पत्ति रोक्का राखी बिगो भराइपाऊँ (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "बिगो भराई पाउन विपक्षीको सम्पत्ति हक हस्तान्तरण हुन नपाउने गरी रोक्का राखिपाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_DC_FIELDS,
      { key: "nationalIdNo", label: "राष्ट्रिय परिचयपत्र नं.", type: "text" },
      { key: "immovablePropertyDetails", label: "रोक्का राख्नुपर्ने अचल सम्पत्तिको विवरण", type: "textarea", required: true },
      { key: "movablePropertyDetails", label: "चल सम्पत्तिको विवरण", type: "textarea" },
      { key: "attachedDocs", label: "संलग्न कागजात", type: "text" },
    ],
    bodyTemplate:
      "श्री {{courtName}} जिल्ला अदालतमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : सम्पत्ति रोक्का राखी बिगो भराइपाऊँ।\n\nमुद्दा नं. {{caseNo}}\nराष्ट्रिय परिचयपत्र नं.: {{nationalIdNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं:–\n\n" +
      "1. उल्लिखित मुद्दामा म/हामी विपक्षीसँग बिगो भराइपाउँ भनी तारेखमा बसेका छु/छौं। विपक्षीको तपसिलबमोजिमको सम्पत्तिबाट बिगो भरी पाउन यो निवेदन पेस गरेको छु/छौं। बिगो रकम असुलउपर हुन सक्ने तपसिलको जग्गा हक हस्तान्तरण गर्न लागेको हुँदा तपसिलबमोजिमको सम्पत्ति कुनै पनि बेहोराले हक हस्तान्तरण, धितो बन्धकसमेत राख्न नपाउने गरी मुलुकी देवानी कार्यविधि संहिता, २०७४ को दफा २४२(६)(७) बमोजिम रोक्का राखिपाऊँ। आवश्यक प्रमाण कागज यसैसाथ छ।\n\n" +
      "रोक्का राख्नुपर्ने सम्पत्तिको विवरण:\n(क) अचल सम्पत्ति: {{immovablePropertyDetails}}\n(ख) चल सम्पत्ति: {{movablePropertyDetails}}\n\nसंलग्न कागजात: {{attachedDocs}}\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. १० — दस्तुर दाखिला गरेको (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "अदालतको आदेशबमोजिम नपुग अदालती शुल्क/अन्य दस्तुर दाखिला गरी हाजिर भएको जनाउने निवेदन।",
    fields: [
      ...COMMON_DC_FIELDS,
      { key: "shortfallFeeAmount", label: "नपुग अदालती शुल्क रु.", type: "text" },
      { key: "expertTestFeeAmount", label: "विशेषज्ञ/वैज्ञानिक परीक्षण दस्तुर रु.", type: "text" },
      { key: "publicationFeeAmount", label: "म्याद/सूचना प्रकाशन दस्तुर रु.", type: "text" },
      { key: "otherFeeAmount", label: "अन्य दस्तुर रु.", type: "text" },
      { key: "bankVoucherNo", label: "बैंक दाखिला भौचर नं.", type: "text" },
    ],
    bodyTemplate:
      "श्री {{courtName}} जिल्ला अदालतमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : दस्तुर दाखिला गरेको।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :–\n\n" +
      "१. उल्लिखित मुद्दामा मलाई/हामीलाई सम्मानित अदालतबाट देहायबमोजिमको दस्तुर लिई हाजिर हुन आउनु भनी तारिख तोकी पाएकोमा देहायबमोजिमको दस्तुर लिई हाजिर हुन आएको छु/छौं।\n\n" +
      "मुलुकी देवानी कार्यविधि संहिता, २०७४ को दफा ७७ बमोजिम नपुग अदालती शुल्क रु. {{shortfallFeeAmount}}\n" +
      "विशेषज्ञ/वैज्ञानिक परीक्षण दस्तुर रु. {{expertTestFeeAmount}}\n" +
      "म्याद/सूचना प्रकाशन दस्तुर रु. {{publicationFeeAmount}}\n" +
      "अन्य दस्तुर रु. {{otherFeeAmount}}\n" +
      "बैंक दाखिला गरेको भौचर नं.: {{bankVoucherNo}}\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
];

async function main() {
  console.log("Seeding Batch 11 — District Court templates (5 more)...");

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

  console.log(`Batch 11 complete. ${created} new template(s) created. जिल्ला अदालत folder: 65/73 done — 8 more remain.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
