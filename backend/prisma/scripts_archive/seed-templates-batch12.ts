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
    title: "फाराम नं. २५ — तामेलीमा राखिपाऊँ (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "निषेधाज्ञा/बन्दीप्रत्यक्षीकरण निवेदनको प्रयोजन समाप्त भएकोले तामेलीमा राखिपाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_DC_FIELDS,
      { key: "filingDate", label: "निवेदन दर्ता मिति", type: "date", required: true },
      { key: "hearingDate", label: "तारिख तोकिएको मिति", type: "date", required: true },
      { key: "closureReason", label: "प्रयोजन समाप्त हुनुको कारण", type: "textarea", required: true },
    ],
    bodyTemplate:
      "श्री {{courtName}} जिल्ला अदालतमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : तामेलीमा राखिपाऊँ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :\n\n" +
      "1. उपर्युक्त निषेधाज्ञा/बन्दीप्रत्यक्षीकरणको निवेदन मिति {{filingDate}} मा दर्ता भई कारबाहीयुक्त अवस्थामा रहेको र म/हामीलाई मिति {{hearingDate}} को तारिख तोकिएकोमा {{closureReason}} कारण परी हाल उक्त निवेदनको प्रयोजन समाप्त भएको हुनाले जिल्ला अदालत नियमावली, २०७५ को नियम ३९ बमोजिम तामेलीमा राखिपाऊँ।\n2. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला/बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ७१ — जेथा परिवर्तन गरिपाऊँ (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "पहिले राखेको जेथा जमानतको सट्टा नयाँ सम्पत्ति जेथा राखी साविकको फुकुवा गरिपाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_DC_FIELDS,
      { key: "orderDate", label: "थुनछेक आदेश मिति", type: "date", required: true },
      { key: "orderedAmount", label: "आदेशित धरौटी रकम रु.", type: "text", required: true },
      { key: "changeReason", label: "जेथा परिवर्तन गर्नुपर्ने कारण", type: "textarea", required: true },
      { key: "oldPropertyDetails", label: "साबिकमा जेथा जमानत बापत रहेको सम्पत्तिको विवरण", type: "textarea", required: true },
      { key: "newPropertyDetails", label: "हाल जेथा जमानत बापत दिएका सम्पत्तिको विवरण", type: "textarea", required: true },
    ],
    bodyTemplate:
      "श्री {{courtName}} जिल्ला अदालतमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : जेथा परिवर्तन गरिपाऊँ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु :\n\n" +
      "1. उपर्युक्त मुद्दामा यस अदालतबाट मिति {{orderDate}} मा म/हामीबाट रु. {{orderedAmount}} धरौटी वा सो बराबरको जेथा जमानत लिने आदेश भएकामा नगद दाखिला गर्न नसकेको हुँदा सो बापत तपसिलमा उल्लिखित सम्पत्ति जेथा जमानी राखेकोमा {{changeReason}} कारणले गर्दा देहायबमोजिमको जेथा परिवर्तन गर्नुपर्ने भएको हुनाले धरौट तथा जमानत निर्देशिका, २०७५ को दफा २६ बमोजिम जेथा परिर्वतन गरी रोक्का जग्गा फुकुवासमेत गरिपाऊँ।\n\n" +
      "(क) साबिकमा जेथा जमानतबापत रहेको सम्पत्तिको विवरणः {{oldPropertyDetails}}\n(ख) हाल जेथा जमानतबापत दिएका सम्पत्तिको विवरणः {{newPropertyDetails}}\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ७२ — नगद धरौट जम्मा गरेको (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "फैसलाबमोजिम कैद/जरिवाना बापत धरौट राखी पुनरावेदन गर्ने सुविधाको लागि नगद धरौट दाखिला गर्ने निवेदन।",
    fields: [
      { key: "courtName", label: "अदालतको नाम", type: "text", autoFillSource: "court.name" },
      { key: "petitionerName", label: "निवेदकको नाम", type: "text", autoFillSource: "client.fullName", required: true },
      { key: "respondentName", label: "विपक्षीको नाम", type: "text", autoFillSource: "case.opposingParty" },
      { key: "caseSubject", label: "मुद्दा", type: "text", autoFillSource: "case.category" },
      { key: "orderDate", label: "थुनछेक आदेश/फैसला मिति", type: "date", required: true },
      { key: "judgeName", label: "माननीय न्यायाधीशको नाम", type: "text", autoFillSource: "case.judge" },
      { key: "sentenceDetails", label: "भएको सजाय (कैद/जरिवाना)", type: "text", required: true },
      { key: "depositAmount", label: "दाखिला गर्ने नगद रकम रु.", type: "text", required: true },
      { key: "submissionDate", label: "मिति", type: "date", autoFillSource: "today" },
    ],
    bodyTemplate:
      "अनुसूची-१ (धरौट तथा जमानत निर्देशिका, २०७५ को दफा ७ सँग सम्बन्धित)\n\nश्री {{courtName}} अदालतमा चढाएको\n\nनिवेदनपत्र\n\nविषयः नगद धरौट जम्मा गरेको।\n\n{{petitionerName}} — निवेदक\n\nविरुद्ध\n\n{{respondentName}} — विपक्षी\n\nमुद्दाः {{caseSubject}}\n\n" +
      "म निवेदक रु.१०।- दस्तुर साथै राखी निम्न बेहोराको निवेदन गर्दछुः-\n\n" +
      "1. उल्लिखित मुद्दामा मिति {{orderDate}} मा थुनछेकको आदेश हुँदा माननीय न्यायाधीश श्री {{judgeName}} को इजलासबाट मलाई धरौट माग्ने गरी आदेश भएकोले/अदालतको फैसलाबमोजिम मलाई भएको {{sentenceDetails}} बापत धरौट राखी पुनरावेदन गर्न पाउने सुविधा प्राप्त गरेकोले त्यसबापतको नगद रकम रु. {{depositAmount}} यसै निवेदनसाथ दाखिला गरेको छु। उक्त धरौट रकम बुझी लिई कानूनबमोजिम तारिखमा रहन/पुनरावेदन दर्ता गर्न पाऊँ।\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ७३ — बैंक जमानत दिइएको (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "फैसलाबमोजिम कैद/जरिवाना बापत बैंक जमानत राखी पुनरावेदन गर्ने सुविधाको लागि बैंक जमानत दाखिला गर्ने निवेदन।",
    fields: [
      { key: "courtName", label: "अदालतको नाम", type: "text", autoFillSource: "court.name" },
      { key: "petitionerName", label: "निवेदकको नाम", type: "text", autoFillSource: "client.fullName", required: true },
      { key: "respondentName", label: "विपक्षीको नाम", type: "text", autoFillSource: "case.opposingParty" },
      { key: "caseSubject", label: "मुद्दा", type: "text", autoFillSource: "case.category" },
      { key: "orderDate", label: "थुनछेक आदेश/फैसला मिति", type: "date", required: true },
      { key: "judgeName", label: "माननीय न्यायाधीशको नाम", type: "text", autoFillSource: "case.judge" },
      { key: "sentenceDetails", label: "भएको सजाय (कैद/जरिवाना)", type: "text", required: true },
      { key: "bankName", label: "बैंकको नाम र शाखा", type: "text", required: true },
      { key: "guaranteeAmount", label: "बैंक जमानत रकम रु.", type: "text", required: true },
      { key: "guaranteeIssueDate", label: "बैंक जमानत जारी मिति", type: "date", required: true },
      { key: "validUntilDate", label: "जमानत मान्य रहने मिति (सम्म)", type: "date" },
      { key: "submissionDate", label: "मिति", type: "date", autoFillSource: "today" },
    ],
    bodyTemplate:
      "अनुसूची-३ (धरौट तथा जमानत निर्देशिका, २०७५ को दफा ११ सँग सम्बन्धित)\n\nश्री {{courtName}} अदालतमा चढाएको\n\nनिवेदनपत्र\n\nविषयः बैंक जमानत दिइएको।\n\n{{petitionerName}} — निवेदक\n\nविरुद्ध\n\n{{respondentName}} — विपक्षी\n\nमुद्दाः {{caseSubject}}\n\n" +
      "म निवेदक रु.१०।- दस्तुर साथै राखी निम्न बेहोराको निवेदन गर्दछुः-\n\n" +
      "1. उल्लिखित मुद्दामा मिति {{orderDate}} मा थुनछेकको आदेश हुँदा माननीय न्यायाधीश श्री {{judgeName}} को इजलासबाट मलाई धरौट वा जमानत माग्ने गरी आदेश भएकोले/अदालतको फैसलाबमोजिम मलाई भएको {{sentenceDetails}} बापत धरौट राखी पुनरावेदन दर्ता गर्न पाउने सुविधा प्राप्त गरेकोले त्यसबापतको नगद रकम {{bankName}} बैंकले मिति {{validUntilDate}} सम्मको लागि मिति {{guaranteeIssueDate}} मा जारी गरेको बैंक जमानत रु. {{guaranteeAmount}} यसै निवेदनसाथ दाखिला गरेको छु। उक्त बैंक जमानत अदालतको आदेशानुसारको अवधिसम्म नवीकरण गराउने छु। उक्त बैंक जमानत बुझिलिई कानूनबमोजिम तारिखमा रहन/पुनरावेदन दर्ता गर्न पाऊँ। बैंक जमानतको सक्कल प्रति र सोसम्बन्धी सम्झौताको प्रतिलिपि यसैसाथ संलग्न गरेको छु।\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ३५ — मृत्युको न्यायिक घोषणा गरिपाऊँ (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "बेपत्ता वा विपद्/दुर्घटनामा परेको व्यक्तिको मृत्युको न्यायिक घोषणा गरिपाऊँ भन्ने निवेदन।",
    fields: [
      { key: "courtName", label: "अदालतको नाम", type: "text", autoFillSource: "court.name" },
      { key: "petitionerName", label: "निवेदकको नाम, थर", type: "text", autoFillSource: "client.fullName", required: true },
      { key: "deceasedName", label: "मृत्युको न्यायिक घोषणा गर्नुपर्ने व्यक्तिको नाम, थर", type: "text", required: true },
      { key: "deceasedAge", label: "बेपत्ता/दुर्घटना पर्दाको उमेर", type: "text" },
      { key: "deceasedAddress", label: "निजको ठेगाना", type: "text" },
      { key: "spouseName", label: "पति वा पत्नीको नाम", type: "text" },
      { key: "missingDate", label: "बेपत्ता/दुर्घटना परेको मिति", type: "date", required: true },
      { key: "missingLocation", label: "बेपत्ता/दुर्घटना परेको स्थान", type: "text", required: true },
      { key: "missingReason", label: "बेपत्ता/दुर्घटना परेको कारण र बेहोरा", type: "textarea", required: true },
      { key: "supportingEvidence", label: "पुष्टि गर्ने आधार प्रमाण", type: "textarea", required: true },
      { key: "relationToDeceased", label: "निवेदकको नाता/सम्बन्ध", type: "text", required: true },
      { key: "submissionDate", label: "मिति", type: "date", autoFillSource: "today" },
    ],
    bodyTemplate:
      "अनुसूची-२१ (मुलुकी देवानी कार्यविधि नियमावली, २०७५ को नियम ६० को उपनियम (१) सँग सम्बन्धित)\n\nश्री {{courtName}} जिल्ला अदालतमा पेस गरेको\n\nनिवेदन पत्र\n\nविषयः मृत्युको न्यायिक घोषणा गरिपाऊँ।\n\n{{petitionerName}} — निवेदक\n\n" +
      "मुलुकी देवानी संहिता, २०७४ को दफा ४० को उपदफा (४) बमोजिम मृत्युको न्यायिक घोषणा गरिपाउँ भनी निम्न विवरणसहित निवेदन गर्दछु। निवेदनबापत लाग्ने दस्तुर रु. ५००।- यसैसाथ संलग्न छ।\n\n" +
      "१. मृत्युको न्यायिक घोषणा गर्नुपर्ने व्यक्तिः नाम {{deceasedName}}, उमेर {{deceasedAge}}, ठेगाना {{deceasedAddress}}, पति/पत्नीको नामः {{spouseName}}\n\n" +
      "२. बेपत्ता/दुर्घटना परेको मितिः {{missingDate}}\n\n३. बेपत्ता/दुर्घटना परेको स्थानः {{missingLocation}}\n\n४. बेपत्ता/दुर्घटना परेको कारण र बेहोराः {{missingReason}}\n\n" +
      "५. पुष्टि गर्ने आधार प्रमाणः {{supportingEvidence}}\n\n६. निवेदकको नाता/सम्बन्धः {{relationToDeceased}}\n\n" +
      "७. संलग्न कागज प्रमाणः निजको पहिचान खुल्ने कागज, निवेदकसँगको नाता प्रमाणित गर्ने कागज, बेपत्ता/दुर्घटना पुष्टि गर्ने कागज, फोटो २।२ प्रति, स्थानीय तहको सिफारिश\n\n" +
      "यस निवेदनपत्रको बेहोरा ठिक साँचो छ, झुट्टा बेहोरा लेखिएको ठहरे कानूनबमोजिम सजाय सहुँला बुझाउँला।\n\nनिवेदकको हस्ताक्षर\n\nमिति: {{submissionDate}}",
  },
];

async function main() {
  console.log("Seeding Batch 12 — District Court templates (5 more, wrapping up)...");

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

  console.log(`Batch 12 complete. ${created} new template(s) created. जिल्ला अदालत folder: 70/73 done — 3 more remain (very minor/rare forms).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
