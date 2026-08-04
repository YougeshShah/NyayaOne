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
    title: "फाराम नं. ५७ — साक्षीको सुरक्षा प्रबन्ध गरिपाऊँ (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "बकपत्रपछि सुरक्षामा खतरा भएमा साक्षी(हरू)को सुरक्षा प्रबन्धको लागि निवेदन।",
    fields: [
      ...COMMON_DC_FIELDS,
      { key: "witnessNames", label: "साक्षी(हरू)को नाम", type: "text", required: true },
      { key: "threatReason", label: "सुरक्षामा खतरा हुनुको कारण", type: "textarea", required: true },
    ],
    bodyTemplate:
      "श्री {{courtName}} जिल्ला अदालतमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : साक्षीको सुरक्षा प्रबन्ध गरिपाऊँ ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :–\n\n" +
      "1. उल्लिखित मुद्दामा म {{witnessNames}} साक्षीको रूपमा रहेको र मलाई/हामीलाई {{threatReason}} कारणले अदालतमा उपस्थित हुन/अदालतमा बकपत्र गरिसकेपछि सुरक्षामा खतरा रहेको हुनाले मुलुकी फौजदारी कार्यविधि संहिता, २०७४ को दफा ११४(१) बमोजिम सुरक्षा प्रबन्ध गरिपाऊँ।\n2. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ५५ — फौजदारी गुज्रेको तारिख थामिपाऊँ (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "काबुबाहिरको परिस्थितिले तारिख गुज्रन गएकोले फौजदारी दफा ८५(१) बमोजिम तारिख थामिपाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_DC_FIELDS,
      { key: "assignedDate", label: "तोकिएको तारिख मिति", type: "date", required: true },
      { key: "lapseReason", label: "तारिख गुज्रनुको कारण", type: "textarea", required: true },
      { key: "attemptCount", label: "पटक संख्या", type: "text" },
      { key: "lapsedDays", label: "गुज्रेको दिन संख्या", type: "text", required: true },
    ],
    bodyTemplate:
      "श्री {{courtName}} जिल्ला अदालतमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : गुज्रेको तारिख थामिपाऊँ ।\n\nमुद्दा/रिट नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखि निम्नानुसार निवेदन गर्दछु/गर्दछौं :\n\n" +
      "१. उल्लिखित मुद्दामा म/हामीले यस अदालतबाट मिति {{assignedDate}} गतेको तारिख तोकी पाएको थिएँ/थियौं। उक्त मितिमा अदालतमा उपस्थित भै तारेख लिनुपर्नेमा {{lapseReason}} भई तारिख गुज्रन गयो। तसर्थ मुलुकी फौजदारी कार्यविधि संहिता, २०७४ को दफा ८५(१) बमोजिम {{attemptCount}} पटक {{lapsedDays}} दिन गुज्रेको तारिख थामिपाऊँ। आवश्यक प्रमाण यसैसाथ छ ।\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. २४ — अदालती शुल्क पछि बुझाउने गरी सुविधा पाऊँ (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "आर्थिक हैसियत कमजोर भएकोले अदालती शुल्क तत्काल दाखिला गर्न नसक्ने हुँदा पछि बुझाउने सुविधा माग्ने निवेदन।",
    fields: [
      ...COMMON_DC_FIELDS,
      { key: "requiredFeeAmount", label: "माग भएको अदालती शुल्क रु.", type: "text", required: true },
      { key: "recommendationLetter", label: "न.पा./गा.पा. को सिफारिसपत्र विवरण", type: "text" },
    ],
    bodyTemplate:
      "श्री {{courtName}} जिल्ला अदालतमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : अदालती शुल्क पछि बुझाउने गरी सुविधा पाऊँ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :–\n\n" +
      "१. उपर्युक्त विषयमा विपक्षीउपर प्रस्तुत मुद्दा दायर गर्न/यस अदालतको आदेशानुसार म/हामीसँगबाट माग भएअनुसारको अदालती शुल्क रु. {{requiredFeeAmount}} दाखिला गर्नुपर्ने भएकोमा मेरो/हाम्रो मुद्दा परेको सम्पत्तिबाहेक अन्य सम्पत्ति नभएकाले/आर्थिक हैसियत कमजोर भएकोले उक्त अदालती शुल्क हाल दाखिल गर्न नसक्ने हुँदा मुलुकी देवानी कार्यविधि संहिता, २०७४ को दफा ६५ बमोजिम अदालती शुल्क पछि बुझाउने गरी सुविधा पाऊँ।\n\nसंलग्न कागजात: (क) {{recommendationLetter}} को सिफारिसपत्र\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ६२ — साक्षी हाजिर गराई बकपत्र गराइपाऊँ (जिल्ला अदालत, फौजदारी)",
    category: DISTRICT_COURT,
    description: "फिरादपत्र/प्रतिउत्तरपत्रमा उल्लिखित साक्षी लिई हाजिर भई बकपत्र गराइपाऊँ भन्ने फौजदारी निवेदन।",
    fields: [...COMMON_DC_FIELDS, { key: "witnessList", label: "साक्षी(हरू)को नाम, जिल्ला, न.पा./गा.पा., वडा नं., उमेर", type: "textarea", required: true }],
    bodyTemplate:
      "श्री {{courtName}} जिल्ला अदालतमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : साक्षी हाजिर गराई बकपत्र गराइपाऊँ ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :–\n\n" +
      "१. उल्लिखित मुद्दामा यस अदालतको आदेशबमोजिम आफ्नो फिरादपत्र र प्रतिउत्तरपत्र/बयानको प्रमाण खण्डमा उल्लिखित साक्षी लिई हाजिर हुन आउनु भनी मलाई/हामीलाई आजको तारिख तोकी पाएकोमा तपसिलमा उल्लिखित साक्षी लिई मुलुकी फौजदारी कार्यविधि संहिता, २०७४ को दफा १०१ बमोजिम उपस्थित भएको छु/छौं। हाजिर गराई अड्डाको तर्फबाट/आफ्नै तर्फबाट/कानून व्यवसायीमार्फत बकपत्र गराइपाऊँ।\n\nसाक्षी विवरण: {{witnessList}}\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ३० — बढी बुझाएको अदालती शुल्क फिर्ता पाऊँ (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "आवश्यक भन्दा बढी अदालती शुल्क बुझाएकोले बढी बुझाइएको रकम फिर्ता पाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_DC_FIELDS,
      { key: "paidReceiptNo", label: "बुझाएको र.नं.", type: "text" },
      { key: "paidDate", label: "बुझाएको मिति", type: "date", required: true },
      { key: "totalPaidAmount", label: "जम्मा बुझाएको रकम रु.", type: "text", required: true },
      { key: "excessAmount", label: "बढी बुझाएको रकम रु.", type: "text", required: true },
    ],
    bodyTemplate:
      "श्री {{courtName}} जिल्ला अदालतमा चढाएको\n\nनिवेदन पत्र\n\nविषय : बढी बुझाएको अदालती शुल्क फिर्ता पाऊँ ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :–\n\n" +
      "1. उल्लिखित मुद्दामा म/हामीले र.नं. {{paidReceiptNo}} मिति {{paidDate}} मा अदालती शुल्क रु. {{totalPaidAmount}} बुझाएकोमध्ये रु. {{excessAmount}} बढी बुझाएको हुनाले बढी बुझाइएको अदालती शुल्क रु. {{excessAmount}} मुलुकी देवानी कार्यविधि संहिता, २०७४ को दफा ७८ बमोजिम फिर्ता पाऊँ।\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ६७ — धरौटी रकम फिर्ता पाऊँ (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "मुद्दा अन्तिम भएकोले वा प्रयोजन समाप्त भएकोले राखेको धरौटी रकम फिर्ता पाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_DC_FIELDS,
      { key: "nationalIdNo", label: "राष्ट्रिय परिचयपत्र नं.", type: "text" },
      { key: "depositAmount", label: "धरौटी अङ्क", type: "text", required: true },
      { key: "receiptNo", label: "धरौटी रसिद नं. र मिति", type: "text" },
      { key: "refundAmount", label: "फिर्ता माग गरेको रकम", type: "text", required: true },
      { key: "refundReason", label: "फिर्ता हुनुपर्ने कारण", type: "textarea", required: true },
    ],
    bodyTemplate:
      "श्री {{courtName}} जिल्ला अदालतमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : धरौटी रकम फिर्ता पाऊँ।\n\nमुद्दा नं. {{caseNo}}\nराष्ट्रिय परिचयपत्र नं.: {{nationalIdNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :–\n\n" +
      "१. उक्त मुद्दामा मैले/हामीले यस अदालतमा राखेको निम्नानुसारको धरौटी मुलुकी देवानी कार्यविधि संहिता, २०७४ को दफा २४८ बमोजिम/मुलुकी फौजदारी कार्यविधि संहिता, २०७४ को दफा ७६ बमोजिम फिर्ता पाऊँ।\n\nधरौटी अङ्क: {{depositAmount}} | रसिद नं. र मिति: {{receiptNo}} | फिर्ता माग गरेको रकम: {{refundAmount}}\nफिर्ता हुनुपर्ने कारण: {{refundReason}}\n\nसंलग्न कागजात: (क) परिचय खुल्ने कागजात (ख) धरौट बुझाएको रसिद (भएमा) (ग) फैसला वा आदेशको प्रतिलिपि\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. २१ — मुद्दा फिर्ता गरिपाऊँ (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "दाबी त्यागी वा दाबीको प्रयोजन समाप्त भएकोले प्रस्तुत मुद्दा फिर्ता गरिपाऊँ भन्ने निवेदन।",
    fields: [...COMMON_DC_FIELDS, { key: "withdrawalReason", label: "मुद्दा फिर्ता लिनुको कारण", type: "text", required: true }],
    bodyTemplate:
      "श्री {{courtName}} जिल्ला अदालतमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : मुद्दा फिर्ता गरिपाऊँ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :–\n\n" +
      "१. मैले/हामीले दायर गरेको फिरादपत्र/निवेदनपत्र/पुनरावेदन पत्रबमोजिमको दाबी त्यागी सो दाबी फिर्ता लिनको लागि/{{withdrawalReason}} भएकोले प्रस्तुत मुद्दा मुलुकी देवानी कार्यविधि संहिता, २०७४ को दफा १९६ बमोजिम फिर्ता गरिपाउन यो निवेदन गरेको छु/छौं। मागबमोजिम मुद्दा फिर्ता गरिपाऊँ।\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
];

async function main() {
  console.log("Seeding Batch 8 — District Court templates (7 more)...");

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

  console.log(`Batch 8 complete. ${created} new template(s) created. जिल्ला अदालत folder: 49/73 done — more remain.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
