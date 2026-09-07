import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * COMMON_FET_FIELDS — the simple single-line petitioner/respondent block used
 * across Foreign Employment Tribunal (वैदेशिक रोजगार न्यायाधिकरण) forms —
 * simpler than the Supreme Court forms in Batch 1 (no address/ward breakdown).
 */
const COMMON_FET_FIELDS = [
  { key: "petitionerName", label: "निवेदकको नाम", type: "text", autoFillSource: "client.fullName", required: true },
  { key: "respondentName", label: "विपक्षीको नाम", type: "text", autoFillSource: "case.opposingParty" },
  { key: "caseNo", label: "मुद्दा नं.", type: "text", autoFillSource: "case.caseNumber" },
  { key: "mobileNo", label: "मोबाइल नं.", type: "text", autoFillSource: "client.phone" },
  { key: "submissionDate", label: "मिति", type: "date", autoFillSource: "today" },
];

const templates = [
  {
    title: "जेथा परिवर्तन गरी पाऊँ (वैदेशिक रोजगार न्यायाधिकरण)",
    category: "निवेदन (वैदेशिक रोजगार)",
    description: "पहिले राखेको जेथा जमानतको सट्टा नयाँ सम्पत्ति जेथा राखी साविकको फुकुवा गरिपाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_FET_FIELDS,
      { key: "guaranteeOrderDate", label: "धरौटी/जमानत आदेश भएको मिति", type: "date", required: true },
      { key: "changeReason", label: "जेथा परिवर्तन गर्नुपर्ने कारण", type: "textarea", required: true },
      { key: "oldPropertyDetails", label: "साविकमा जेथा जमानत बापत रहेको सम्पत्तिको विवरण", type: "textarea", required: true },
      { key: "newPropertyDetails", label: "हाल जेथा जमानत बापत दिइएको सम्पत्तिको विवरण", type: "textarea", required: true },
    ],
    bodyTemplate:
      "श्री वैदेशिक रोजगार न्यायाधिकरण, काठमाडौंमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय: जेथा परिर्वतन गरी पाऊँ।\n\nमुद्दा नं. {{caseNo}}\n\n{{petitionerName}} — निवेदक\n\nविरुद्ध\n\n{{respondentName}} — विपक्षी\n\nमुद्दाः वैदेशिक रोजगार कसूर।\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु:\n\n" +
      "१. उपरोक्त मुद्दामा यस न्यायाधिकरणबाट थुनछेक आदेश हुदा मिति {{guaranteeOrderDate}} मा मबाट धरौटी वा सो बराबरको जेथा जमानत लिने आदेश भए बमोजिम तपसिलमा उल्लिखित सम्पत्ति जेथा जमानी राखेको थिएँ। तर मलाई {{changeReason}} कारणले गर्दा सो जेथा वापत देहाय बमोजिमको जेथा परिवर्तन गर्नुपर्ने भएको हुनाले धरौट तथा जमानत निर्देशिका, २०७५ को दफा २६ बमोजिम जेथा परिर्वतन गरी सो जग्गा रोक्का राखी साविकमा रोक्का राखिएको जग्गा फुकुवा समेत गरी पाऊँ ।\n\n" +
      "(क) साबिकमा जेथा जमानत बापत रहेको सम्पत्तिको विवरणः {{oldPropertyDetails}}\n\n" +
      "(ख) हाल जेथा जमानत बापत दिएका सम्पत्तिको विवरण: {{newPropertyDetails}}\n\n" +
      "२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला।\n\nनिवेदक\n\nमो.नं.: {{mobileNo}}\n\nमिति: {{submissionDate}}",
  },
  {
    title: "मुद्दा मुलतबीबाट जगाई पाऊँ (वैदेशिक रोजगार न्यायाधिकरण)",
    category: "निवेदन (वैदेशिक रोजगार)",
    description: "मुलतबीमा राखिएको कारण समाप्त भएकोले मुद्दा जगाई कारवाही अगाडि बढाइपाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_FET_FIELDS,
      { key: "suspensionReason", label: "मुलतबी हुनुको कारण", type: "textarea", required: true },
      { key: "suspensionOrderDate", label: "मुलतबी आदेशको मिति", type: "date", required: true },
      { key: "attachedDoc1", label: "संलग्न कागजात (क)", type: "text" },
      { key: "attachedDoc2", label: "संलग्न कागजात (ख)", type: "text" },
    ],
    bodyTemplate:
      "श्री वैदेशिक रोजगार न्यायाधिकरण, काठमाडौँमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : मुद्दा मुलतबीबाट जगाई पाऊँ।\n\nमुद्दा नं. {{caseNo}}\n\n{{petitionerName}} — निवेदक\n\nविरुद्ध\n\n{{respondentName}} — विपक्षी\n\nमुद्दाः वैदेशिक रोजगार कसूर ।\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :\n\n" +
      "1. प्रस्तुत मुद्दा {{suspensionReason}} कारणबाट न्यायाधिकरणको मिति {{suspensionOrderDate}} को आदेशानुसार मुलतबीमा रहेकोमा उक्त प्रयोजन समाप्त भइसकेकोले वैदेशिक रोजगार न्यायाधिकरण नियमावली, २०६८ को नियम ३७ बमोजिम मुलतबीबाट जगाई कारवाही गरी पाउन सम्बन्धित कागजात संलग्न राखी निवेदन गर्दछु। मुद्दा मुलतबीबाट जगाइ पाउँ।\n\n" +
      "संलग्न कागजात:\n(क) {{attachedDoc1}}\n(ख) {{attachedDoc2}}\n\n" +
      "२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमो.नं.: {{mobileNo}}\n\nमिति: {{submissionDate}}",
  },
  {
    title: "जाहेरवाला उपस्थित हुन नसक्ने जानकारी (वैदेशिक रोजगार न्यायाधिकरण)",
    category: "निवेदन (वैदेशिक रोजगार)",
    description: "बकपत्रको लागि तोकिएको मितिमा जाहेरवाला/पीडित बाहिर रहेकोले उपस्थित हुन नसक्ने जानकारी दिने निवेदन।",
    fields: [
      ...COMMON_FET_FIELDS,
      { key: "complainantName", label: "जाहेरवाला/पीडितको नाम", type: "text", required: true },
      { key: "testimonyDate", label: "बकपत्रको लागि तोकिएको मिति", type: "date", required: true },
      { key: "relationToComplainant", label: "जाहेरवालासँगको नाता", type: "text" },
      { key: "unavailableSince", label: "बाहिर रहेको मिति देखि", type: "date" },
      { key: "unavailableLocation", label: "हाल रहेको ठाउँ/कारण", type: "text", required: true },
    ],
    bodyTemplate:
      "श्री वैदेशिक रोजगार न्यायाधिकरण, काठमाडौँमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : जानकारी गराएको बारे।\n\nमुद्दा नं. {{caseNo}}\n\n{{petitionerName}} — निवेदक\n\nविरुद्ध\n\n{{respondentName}} — विपक्षी\n\nमुद्दा– बैदेशिक रोजगार कसूर।\n\n" +
      "निवेदनबापत रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु:\n\n" +
      "1. उल्लिखित मुद्दामा जाहेरवाला/पीडित {{complainantName}} लाई मिति {{testimonyDate}} मा बकपत्रको लागि उपस्थित हुन म्याद जारी/जानकारी प्राप्त भएको छ। निज जाहेरवाला मेरो एकासंगोलको {{relationToComplainant}} नाताको व्यक्ति हुनु हुन्छ। तर निज जाहेरवाला/पीडित मिति {{unavailableSince}} देखि {{unavailableLocation}} ठाउँमा भएकोले बकपत्रको लागि न्यायाधिकरणमा उपस्थित हुन नसक्ने व्यहोरा जानकारीको लागि अनुरोध गर्दछु।\n\n" +
      "२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमो.नं.: {{mobileNo}}\n\nमिति: {{submissionDate}}",
  },
  {
    title: "जेथाको सट्टा नगद धरौटी दाखिला गरी पाऊँ (वैदेशिक रोजगार न्यायाधिकरण)",
    category: "निवेदन (वैदेशिक रोजगार)",
    description: "जेथा जमानत राखेकोमा माग भएको नगद धरौटी दाखिला गरी जेथा फुकुवा गरिपाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_FET_FIELDS,
      { key: "orderDate", label: "थुनछेक आदेश मिति", type: "date", required: true },
      { key: "orderedAmount", label: "आदेशित धरौटी रकम रु.", type: "text", required: true },
      { key: "depositedAmount", label: "दाखिला गरेको रकम रु.", type: "text", required: true },
      { key: "propertyDetails", label: "जेथा जमानत बापत रहेको/फुकुवा माग गरिएको सम्पत्तिको विवरण", type: "textarea", required: true },
    ],
    bodyTemplate:
      "श्री वैदेशिक रोजगार न्यायाधिकरण, काठमाडौँमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय: जेथाको सट्टा नगद धरौटी दाखिला गरी पाऊँ।\n\nमुद्दा नं. {{caseNo}}\n\n{{petitionerName}} — निवेदक\n\nविरुद्ध\n\n{{respondentName}} — विपक्षी\n\nमुद्दाः वैदेशिक रोजगार कसूर।\n\n" +
      "निवेदन वापत रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु:\n\n" +
      "१. प्रस्तुत मुद्दामा यस न्यायाधिकरणबाट थुनछेक आदेश हुँदा मिति {{orderDate}} मा मबाट रु. {{orderedAmount}} धरौटी वा सो बराबरको जेथा जमानत लिने आदेश भए बमोजिम नगद दाखिला गर्न नसकेको हुँदा सोबापत तपसिलमा उल्लेखित सम्पत्ति जेथा जमानी राखेको थिएँ। हाल मसँग माग भएको धरौट रकम रु. {{depositedAmount}} यसै निवेदन साथ दाखिला गरेको छु। नगद धरौटी लिई जेथा जमानतमा रहेको तपसिलको जग्गा फुकूवा गरी पाऊँ।\n\n" +
      "जेथा जमानतबापत रहेको सम्पत्तिको विवरण: {{propertyDetails}}\n\n" +
      "२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमो.नं.: {{mobileNo}}\n\nमिति: {{submissionDate}}",
  },
  {
    title: "बैंक जमानत दिइएको (वैदेशिक रोजगार न्यायाधिकरण)",
    category: "निवेदन (वैदेशिक रोजगार)",
    description: "थुनछेक आदेश बमोजिम बैंक जमानत दाखिला गरेको जनाउने निवेदन।",
    fields: [
      ...COMMON_FET_FIELDS,
      { key: "orderDate", label: "थुनछेक आदेश मिति", type: "date", required: true },
      { key: "guaranteeAmount", label: "जमानत रकम रु.", type: "text", required: true },
      { key: "bankName", label: "बैंकको नाम र कार्यालय", type: "text", required: true },
      { key: "bankGuaranteeDate", label: "बैंक जमानत जारी मिति", type: "date", required: true },
    ],
    bodyTemplate:
      "(धरौट तथा जमानत निर्देशिका, २०७५ को दफा ११ सँग सम्बन्धित)\n\nश्री वैदेशिक रोजगार न्यायाधिकरण, काठमाडौँमा पेस गरेको\n\nनिवेदन पत्र\n\nविषयः बैंक जमानत दिइएको।\n\nमुद्दा नं. {{caseNo}}\n\n{{petitionerName}} — निवेदक\n\nविरुद्ध\n\n{{respondentName}} — विपक्षी\n\nमुद्दाः वैदेशिक रोजगार कसूर।\n\n" +
      "म निवेदक रु.१०।- साथै राखी निम्न बेहोराको निवेदन गर्दछुः\n\n" +
      "1. उल्लेखित मुद्दामा यस न्यायाधिकरणबाट मिति {{orderDate}} मा थुनछेकको आदेश हुँदा मलाई रु. {{guaranteeAmount}} धरौट वा जमानत लिने भनी आदेश भएकोले त्यस बापतको नगद रकमको {{bankName}} बैंकले मिति {{bankGuaranteeDate}} मा जारी गरेको बैंक जमानत यसै निवेदनसाथ दाखिला गरेको छु। उक्त बैंक जमानत बुझी लिई कानूनबमोजिम तारिखमा रही मुद्दाको पुर्पक्ष गर्न पाउँ। बैंक जमानतको सक्कल प्रति र सोसम्बन्धी सम्झौताको प्रतिलिपि यसैसाथ संलग्न गरेको छु।\n" +
      "2. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला।\n\nनिवेदक\n\nमो.नं.: {{mobileNo}}\n\nमिति: {{submissionDate}}",
  },
  {
    title: "सम्पत्ति रोक्का राखी पाऊँ (वैदेशिक रोजगार न्यायाधिकरण)",
    category: "निवेदन (वैदेशिक रोजगार)",
    description: "दाबीको विगो असुल गर्न विपक्षीको सम्पत्ति हक हस्तान्तरण हुन नपाउने गरी रोक्का राखिपाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_FET_FIELDS,
      { key: "immovablePropertyDetails", label: "रोक्का राख्नुपर्ने अचल सम्पत्तिको विवरण", type: "textarea", required: true },
      { key: "movablePropertyDetails", label: "चल सम्पत्तिको विवरण", type: "textarea" },
      { key: "attachedDocs", label: "संलग्न कागजात", type: "text" },
    ],
    bodyTemplate:
      "श्री वैदेशिक रोजगार न्यायाधिकरण, काठमाडौँमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : सम्पत्ति रोक्का राखी पाऊँ ।\n\nमुद्दा नं. {{caseNo}}\n\n{{petitionerName}} — निवेदक\n\nविरुद्ध\n\n{{respondentName}} — विपक्षी\n\nमुद्दाः वैदेशिक रोजगार कसूर।\n\n" +
      "निवेदनबापत रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :–\n\n" +
      "1. उल्लिखित विपक्षी उपर यस न्यायाधिकरणमा प्रस्तुत मुद्दा दायर गरी हाल विचाराधीन अवस्थामा छ। उक्त मुद्दामा विपक्षीसँग मेरो विगो समेत भराई पाउन दावी छ। मेरो दावीको विगो असुल गर्न मैले दाबी गरेको देहायको सम्पत्ति विपक्षीले अन्य व्यक्तिहरुलाई हक हस्तान्तरण गर्ने सम्भावना रहेको छ। उक्त सम्पत्ति हक हस्तान्तरण भई गएमा मेरो हकमा असर पर्ने भएकोले तपसिल बमोजिमको सम्पत्ति कुनै पनि बेहोराले हक हस्तान्तरण, धितो बन्धक समेत राख्न नपाउने गरी रोक्का राखी पाऊँ। आवश्यक प्रमाण कागज यसैसाथ छ ।\n\n" +
      "रोक्का राख्नु पर्ने सम्पत्तिको विवरण\n(क) अचल सम्पत्ति: {{immovablePropertyDetails}}\n(ख) चल सम्पत्तिः {{movablePropertyDetails}}\n\n" +
      "संलग्न कागजात: {{attachedDocs}}\n\n" +
      "२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमो.नं.: {{mobileNo}}\n\nमिति: {{submissionDate}}",
  },
  {
    title: "धरौटी रकम फिर्ता पाऊँ (वैदेशिक रोजगार न्यायाधिकरण)",
    category: "निवेदन (वैदेशिक रोजगार)",
    description: "मुद्दाको अन्तिम फैसला भई सफाई पाएकोले राखेको धरौटी फिर्ता गरिपाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_FET_FIELDS,
      { key: "judgmentDate", label: "अन्तिम फैसला मिति", type: "date", required: true },
      { key: "judgmentOutcome", label: "फैसलाको परिणाम (सफाई/अन्य)", type: "text", required: true },
      { key: "depositAmount", label: "धरौटी रकम", type: "text", required: true },
      { key: "depositReceiptNo", label: "धरौटी रसिद नं. र मिति", type: "text" },
      { key: "refundReason", label: "फिर्ता हुनुपर्ने कारण", type: "textarea", required: true },
    ],
    bodyTemplate:
      "श्री वैदेशिक रोजगार न्यायाधिकरण, काठमाडौँमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : धरौटी रकम फिर्ता पाऊँ।\n\nमुद्दा नं. {{caseNo}}\n\n{{petitionerName}} — निवेदक\n\nविरुद्ध\n\n{{respondentName}} — विपक्षी\n\nमुद्दाः-वैदेशिक रोजगार कसूर ।\n\n" +
      "निवेदनबापत रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु :\n\n" +
      "1. प्रस्तुत मुद्दामा मैले यस न्यायाधिकरणको आदेश बमोजिम धरौटी नगदै राखेकोमा मैले आरोपित कसुरबाट {{judgmentOutcome}} ठहरी यस न्यायाधिकरण/सर्वोच्च अदालतबाट मिति {{judgmentDate}} मा अन्तिम फैसला भएकोले मैले यस न्यायाधिकरणमा राखेको निम्नानुसारको धरौटी फिर्ता पाऊँ।\n\n" +
      "धरौटी रकम: {{depositAmount}} | धरौटी रसिद नं. र मिति: {{depositReceiptNo}} | फिर्ता हुनुपर्ने कारण: {{refundReason}}\n\n" +
      "देहायको कागजात यसैसाथ संलग्न छ: (क) परिचय खुल्ने कागजात (ख) धरौट बुझाएको रसिद (भएमा) (ग) फैसलाको प्रतिलिपि\n\n" +
      "२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमो.नं.: {{mobileNo}}\n\nमिति: {{submissionDate}}",
  },
  {
    title: "गुज्रेको तारिख थामी पाऊँ (वैदेशिक रोजगार न्यायाधिकरण)",
    category: "निवेदन (वैदेशिक रोजगार)",
    description: "काबुबाहिरको परिस्थितिले तारिख गुज्रन गएकोले सो तारिख थामी पाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_FET_FIELDS,
      { key: "assignedDate", label: "तोकिएको तारिख मिति", type: "date", required: true },
      { key: "firstAttemptDays", label: "पहिलो पटक (दिन)", type: "text" },
      { key: "secondAttemptDays", label: "दोस्रो पटक बाँकी रहेको दिनबाट", type: "text" },
      { key: "lapsedDays", label: "गुज्रेको दिन संख्या", type: "text", required: true },
    ],
    bodyTemplate:
      "श्री वैदेशिक रोजगार न्यायाधिकरण, काठमाडौँमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : गुज्रेको तारिख थामी पाऊँ।\n\nमुद्दा नं. {{caseNo}}\n\n{{petitionerName}} — निवेदक\n\nविरुद्ध\n\n{{respondentName}} — विपक्षी\n\nमुद्दा– बैदेशिक रोजगार कसूर।\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं:\n\n" +
      "१. उक्त मुद्दामा न्यायाधिकरणबाट मलाई मिति {{assignedDate}} गतेको तारिख तोकी पाएकोमा काबुबाहिरको परिस्थिति परी न्यायाधिकरणमा उपस्थित भै तारिख लिन नसकी सो तारिख गुज्रन गयो।\n\n" +
      "२. तसर्थ उक्त गुज्रेको तारेख संक्षिप्त कार्यविधि ऐन, २०२८ को दफा ८ (१) बमोजिम १५ दिनमध्ये पहिलो पटक {{firstAttemptDays}} दिन/दोस्रो पटक १५ दिनमध्ये बाँकी रहेको दिन {{secondAttemptDays}} बाट गुज्रेको तारिख {{lapsedDays}} दिन थामि पाउँ।\n\n" +
      "३. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला/बुझाउँला।\n\nनिवेदक\n\nमो.नं.: {{mobileNo}}\n\nमिति: {{submissionDate}}",
  },
  {
    title: "नक्कल निवेदन (वैदेशिक रोजगार न्यायाधिकरण)",
    category: "निवेदन (वैदेशिक रोजगार)",
    description: "मुद्दाका लिखत/प्रमाणको नक्कल सारी लिन पाऊँ भन्ने निवेदन।",
    fields: [
      { key: "petitionerName", label: "निवेदकको नाम", type: "text", autoFillSource: "client.fullName", required: true },
      { key: "respondentName", label: "विपक्षीको नाम", type: "text", autoFillSource: "case.opposingParty" },
      { key: "caseNo", label: "मुद्दा नं.", type: "text", autoFillSource: "case.caseNumber" },
      { key: "caseSubject", label: "मुद्दा", type: "text", autoFillSource: "case.category" },
      { key: "requestedDocuments", label: "नक्कल माग गरेका लिखत/प्रमाण (सूची)", type: "textarea", required: true },
      { key: "submissionDate", label: "मिति", type: "date", autoFillSource: "today" },
    ],
    bodyTemplate:
      "श्री बैदेशिक रोजगार न्यायाधिकरण बबरमहल, काठमाण्डौ\n\nनक्कलको निवेदन-पत्र\n\nमुद्दा नं. {{caseNo}}\n\nमुद्दाः {{caseSubject}}\n\n{{petitionerName}} — निवेदक\n\nविरुद्ध\n\n{{respondentName}} — विपक्षी\n\n" +
      "म निवेदक निम्नबमोजिमको लिखत/लिखतहरुको नक्कल अड्डाकै/आफ्नो तर्फबाट सारी लिन पाउँ भनी नियम बमोजिमको दस्तुर साथै राखी निवेदन गर्दछु :\n\n" +
      "नक्कल माग गरेका लिखत/प्रमाणः {{requestedDocuments}}\n\n" +
      "यसमा लेखिएको बेहोरा ठीक छ झूठा ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "बयान गराई पाऊँ (वैदेशिक रोजगार न्यायाधिकरण)",
    category: "निवेदन (वैदेशिक रोजगार)",
    description: "समाव्हान म्याद तामेल भएपछि हाजिर भई बयान गराई पाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_FET_FIELDS,
      { key: "summonServedDate", label: "समाव्हान म्याद तामेल मिति", type: "date", required: true },
    ],
    bodyTemplate:
      "श्री वैदेशिक रोजगार न्यायाधिकरण, काठमाडौँमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : बयान गराई पाऊँ ।\n\nमुद्दा नं. {{caseNo}}\n\n{{petitionerName}} — निवेदक\n\nविरुद्ध\n\n{{respondentName}} — विपक्षी\n\nमुद्दा– वैदेशिक रोजगार कसूर।\n\n" +
      "निवेदनबापत रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :–\n\n" +
      "१. उल्लिखित मुद्दामा यस न्यायाधिकरणबाट मेरा नाममा जारी भएको ७ दिने समाव्हान म्याद मिति {{summonServedDate}} मा तामेल भएकाले म्याद भित्र/म्याद थामी हाजिर हुन आएको छु। बयान गराई पाउँ।\n\n" +
      "२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमो.नं.: {{mobileNo}}\n\nमिति: {{submissionDate}}",
  },
];

async function main() {
  console.log("Seeding Batch 2 — Foreign Employment Tribunal petition form templates (Folder 2, first 10 forms)...");

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

  console.log(`Batch 2 complete. ${created} new template(s) created.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
