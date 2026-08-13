import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const FOREIGN_EMPLOYMENT = "सेवाग्राहीले वैदेशिक रोजगार न्यायाधिकरणमा पेस गर्ने निवेदनका ढाँचाहरू";

const COMMON_FET_FIELDS = [
  { key: "petitionerName", label: "निवेदकको नाम", type: "text", autoFillSource: "client.fullName", required: true },
  { key: "respondentName", label: "विपक्षीको नाम", type: "text", autoFillSource: "case.opposingParty" },
  { key: "caseNo", label: "मुद्दा नं.", type: "text", autoFillSource: "case.caseNumber" },
  { key: "mobileNo", label: "मोबाइल नं.", type: "text", autoFillSource: "client.phone" },
  { key: "submissionDate", label: "मिति", type: "date", autoFillSource: "today" },
];

const templates = [
  {
    title: "शारीरिक जाँच गराई पाउँ (वैदेशिक रोजगार न्यायाधिकरण)",
    category: FOREIGN_EMPLOYMENT,
    description: "हिरासतमा रहँदा शारीरिक स्वास्थ्य समस्याको कारण शारीरिक जाँच गराई पाउने निवेदन।",
    fields: [
      ...COMMON_FET_FIELDS,
      { key: "custodyStartDate", label: "हिरासतमा परेको मिति", type: "date", required: true },
      { key: "healthReason", label: "जाँच गराउनुपर्ने कारण", type: "textarea", required: true },
    ],
    bodyTemplate:
      "श्री वैदेशिक रोजगार न्यायाधिकरण, काठमाडौंमा चढाएको\n\nनिवेदन पत्र\n\nविषय : शारीरिक जाँच गरी पाऊँ।\n\nमुद्दा नं. {{caseNo}}\n\n{{petitionerName}} — निवेदक\n\nविरुद्ध\n\n{{respondentName}} — विपक्षी\n\nमुद्दा– वैदेशिक रोजगार कसूर\n\nनिवेदनबापत रु.१०।– साथै राखि निम्नानुसार निवेदन गर्दछु/गर्दछौं :–\n\n" +
      "1. उल्लिखित मुद्दा म/हामी मिति {{custodyStartDate}} गतेदेखि अनुसन्धानको क्रममा पक्राउ परी प्रहरी हिरासतमा रहेका छु/छौं। हिरासतमा रहदा म/हामीलाई {{healthReason}} हुनाले मुलुकी फौजदारी कार्यविधि संहिता, २०७४ को दफा १४(५) बमोजिम शारीरिक जाँच गरिपाऊँ।\n2. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमो.नं.: {{mobileNo}}\n\nमिति: {{submissionDate}}",
  },
  {
    title: "नगद धरौट जम्मा गरेको (वैदेशिक रोजगार न्यायाधिकरण)",
    category: FOREIGN_EMPLOYMENT,
    description: "थुनछेक आदेश बमोजिम नगद धरौटी यसैसाथ दाखिला गरेको जनाउने निवेदन।",
    fields: [
      ...COMMON_FET_FIELDS,
      { key: "orderDate", label: "थुनछेक आदेश मिति", type: "date", required: true },
      { key: "orderedAmount", label: "आदेशित धरौटी रकम रु.", type: "text", required: true },
      { key: "depositedAmount", label: "दाखिला गरेको रकम रु.", type: "text", required: true },
    ],
    bodyTemplate:
      "(धरौट तथा जमानत निर्देशिका, २०७५ को दफा ७ सँग सम्बन्धित)\n\nश्री वैदेशिक रोजगार न्यायाधिकरण, काठमाडौँमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : नगद धरौट जम्मा गरेको।\n\nमुद्दा नं. {{caseNo}}\n\n{{petitionerName}} — निवेदक\n\nविरुद्ध\n\n{{respondentName}} — विपक्षी\n\nमुद्दाः-वैदेशिक रोजगार कसूर।\n\nनिवेदनबापत रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु :\n\n" +
      "1. प्रस्तुत मुद्दामा यस न्यायाधिकरणबाट मिति {{orderDate}} मा थुनछेकको आदेश हुँदा मलाई रु. {{orderedAmount}} नगद धरौट वा सो बराबरको जेथा जमानत लिने आदेश भएकोले उक्त आदेश बमोजिमको धरौटी नगदै रु. {{depositedAmount}} यसैसाथ दाखिला गरेको छु। उक्त रकम बुझी लिई तारेखमा रही मुद्दाको पुर्पक्ष गर्न पाउँ।\n2. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला।\n\nनिवेदक\n\nमो.नं.: {{mobileNo}}\n\nमिति: {{submissionDate}}",
  },
  {
    title: "रोक्का रहेको सम्पत्ति फुकुवा गरी पाउँ (वैदेशिक रोजगार न्यायाधिकरण)",
    category: FOREIGN_EMPLOYMENT,
    description: "अनावश्यक रोक्का रहेको सम्पत्ति फुकुवा गरिपाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_FET_FIELDS,
      { key: "propertyDetails", label: "रोक्का रहेको सम्पत्तिको विवरण", type: "textarea", required: true },
      { key: "releaseReason", label: "फुकुवा हुनुपर्ने कारण", type: "textarea", required: true },
      { key: "propertyLocation", label: "जग्गाको जिल्ला/न.पा./गा.पा./वडा/कि.नं.", type: "textarea" },
    ],
    bodyTemplate:
      "श्री वैदेशिक रोजगार न्यायाधिकरण, काठमाडौंमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : रोक्का रहेको सम्पत्ति फुकुवा गरी पाऊँ ।\n\nमुद्दा नं. {{caseNo}}\n\n{{petitionerName}} — निवेदक\n\nविरुद्ध\n\n{{respondentName}} — विपक्षी\n\nमुद्दाः वैदेशिक रोजगार कसूर\n\nनिवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं:\n\n" +
      "१. उक्त मुद्दामा तपसिलको सम्पति रोक्का राख्न नपर्ने हुँदा फुकूवा गरी पाऊँ।\n\nरोक्का रहेको सम्पत्तिको विवरण: {{propertyDetails}}\nस्थान (जिल्ला/न.पा./गा.पा./वडा/कि.नं.): {{propertyLocation}}\nफुकुवा हुनुपर्ने कारण: {{releaseReason}}\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमो.नं.: {{mobileNo}}\n\nमिति: {{submissionDate}}",
  },
  {
    title: "मुद्दा मुलतबीमा राखि पाऊँ (वैदेशिक रोजगार न्यायाधिकरण)",
    category: FOREIGN_EMPLOYMENT,
    description: "अन्तरप्रभावी अर्को मुद्दा फैसला नहुन्जेल हालको मुद्दा मुलतबीमा राख्न दिने निवेदन।",
    fields: [
      ...COMMON_FET_FIELDS,
      { key: "suspensionReason", label: "मुलतबी रहनुपर्ने कारण", type: "textarea", required: true },
      { key: "attachedDoc1", label: "संलग्न कागजात (क)", type: "text" },
      { key: "attachedDoc2", label: "संलग्न कागजात (ख)", type: "text" },
    ],
    bodyTemplate:
      "श्री वैदेशिक रोजगार न्यायाधिकरण, काठमाडौँमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : मुद्दा मुलतबी राखी पाऊँ।\n\nमुद्दा नं. {{caseNo}}\n\n{{petitionerName}} — निवेदक\n\nविरुद्ध\n\n{{respondentName}} — विपक्षी\n\nमुद्दाः वैदेशिक रोजगार कसूर ।\n\nनिवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :\n\n" +
      "१. प्रस्तुत मुद्दा सम्मानित अदालतमा दायर भई कारबाहीयुक्त अवस्थामा रहेको छ । निम्न कारण परेकोले उल्लिखित मुद्दा वैदेशिक रोजगार न्यायाधिकरण नियमावली, २०६८ को नियम ३७ बमोजिम मुलतबीमा राखिपाऊँ।\n\nमुलतबी रहनुपर्ने कारणः {{suspensionReason}}\n\nसंलग्न कागजात:\n(क) {{attachedDoc1}}\n(ख) {{attachedDoc2}}\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमो.नं.: {{mobileNo}}\n\nमिति: {{submissionDate}}",
  },
  {
    title: "धरौटी कायम गरी पाउँ (वैदेशिक रोजगार न्यायाधिकरण)",
    category: FOREIGN_EMPLOYMENT,
    description: "वैदेशिक रोजगार विभागमा राखेको धरौटी मध्येबाट न्यायाधिकरणको आदेशानुसार धरौटी कायम गरिपाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_FET_FIELDS,
      { key: "departmentDepositAmount", label: "वैदेशिक रोजगार विभागमा जम्मा गरेको धरौटी रु.", type: "text", required: true },
      { key: "departmentReceiptNo", label: "विभाग दाखिला रसिद नं. र मिति", type: "text" },
      { key: "orderDate", label: "थुनछेक आदेश मिति", type: "date", required: true },
      { key: "requiredAmount", label: "आदेशानुसार माग भएको धरौटी रु.", type: "text", required: true },
    ],
    bodyTemplate:
      "श्री वैदेशिक रोजगार न्यायाधिकरण, काठमाडौंमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय: धरौटी कायम गरी पाऊँ ।\n\nमुद्दा नं. {{caseNo}}\n\n{{petitionerName}} — निवेदक\n\nविरुद्ध\n\n{{respondentName}} — विपक्षी\n\nमुद्दाः वैदेशिक रोजगार कसूर।\n\nनिवेदनबापत रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु:\n\n" +
      "१. प्रस्तुत मुद्दामा अनुसन्धानको क्रममा वैदेशिक रोजगार विभागमा म सँग रु. {{departmentDepositAmount}} धरौटी लिने आदेश भए बमोजिम सो धरौटी नगदै सो विभागमा {{departmentReceiptNo}} मा दाखिला गरेको छु। यस न्यायाधिकरणबाट मिति {{orderDate}} मा थुनछेक आदेश हुँदा म बाट रु. {{requiredAmount}} नगद धरौट वा जेथा जमानत दिए लिनु भनी आदेश भएकोले उक्त आदेशानुसारको धरौटी वैदेशिक रोजगार विभागमा राखेको उक्त धरौटी मध्येबाट कायम गरी तारेखमा रही मुद्दा पुर्पक्ष गर्न पाउँ।\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमो.नं.: {{mobileNo}}\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फैसला आदेश संशोधन गरी पाऊँ (वैदेशिक रोजगार न्यायाधिकरण)",
    category: FOREIGN_EMPLOYMENT,
    description: "फैसला/आदेशमा टाइप/लेखाइको त्रुटि सच्याउन संशोधन गरिपाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_FET_FIELDS,
      { key: "judgmentDate", label: "फैसला/आदेश मिति", type: "date", required: true },
      { key: "errorContent", label: "फैसला/आदेशमा भएको त्रुटिको बेहोरा", type: "text" },
      { key: "errorPageNo", label: "पाना नं.", type: "text" },
      { key: "errorLineNo", label: "हरफ", type: "text" },
      { key: "correctedContent", label: "संशोधन हुनुपर्ने बेहोरा", type: "textarea", required: true },
    ],
    bodyTemplate:
      "श्री वैदेशिक रोजगार न्यायाधिकरण, काठमाडौँमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : फैसला/आदेश संशोधन गरी पाऊँ।\n\nमुद्दा नं. {{caseNo}}\n\n{{petitionerName}} — निवेदक\n\nविरुद्ध\n\n{{respondentName}} — विपक्षी\n\nमुद्दाः-वैदेशिक रोजगार कसूर ।\n\nनिवेदनबापत रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु :\n\n" +
      "१. प्रस्तुत मुद्दा यस न्यायाधिकरण दायर भई मिति {{judgmentDate}} मा फैसला/आदेश भएको छ। सो फैसला/आदेशमा तपसिलमा उल्लेख भए अनुसारको टाइप/लेखाइको भूलबाट त्रुटी हुन गएको हुँदा सोको सट्टा तपसिल बमोजिमको व्यहोरा कायम गर्ने गरी न्याय प्रशासन ऐन, २०७३ को दफा १८ र वैदेशिक रोजगार न्यायाधिकरण नियमावली, २०६८ को नियम ३८(२) बमोजिम संशोधन गरी पाऊँ।\n\nत्रुटिको बेहोरा: {{errorContent}} | पाना नं.: {{errorPageNo}} | हरफ: {{errorLineNo}}\nसंशोधन हुनुपर्ने बेहोरा: {{correctedContent}}\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमो.नं.: {{mobileNo}}\n\nमिति: {{submissionDate}}",
  },
  {
    title: "प्रतिवादीले राखेको धरौटी विगो वापत फिर्ता पाउँ (वैदेशिक रोजगार न्यायाधिकरण)",
    category: FOREIGN_EMPLOYMENT,
    description: "अन्तिम फैसला भई विगो भराई पाउने ठहरेकोले प्रतिवादीले राखेको धरौटी विगो वापत फिर्ता पाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_FET_FIELDS,
      { key: "defendantName", label: "प्रतिवादीको नाम", type: "text", required: true },
      { key: "compensationAmount", label: "भराई पाउने विगो रकम रु.", type: "text", required: true },
      { key: "judgmentDate", label: "फैसला मिति", type: "date", required: true },
      { key: "depositReceiptNo", label: "धरौटी रसिद नं.", type: "text" },
      { key: "depositAmount", label: "धरौटी राखेको रकम", type: "text", required: true },
    ],
    bodyTemplate:
      "श्री वैदेशिक रोजगार न्यायाधिकरण, काठमाडौंमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : प्रतिवादीले राखेको धरौटी विगो वापत फिर्ता पाऊँ।\n\nमुद्दा नं. {{caseNo}}\n\n{{petitionerName}} — निवेदक\n\nविरुद्ध\n\n{{respondentName}} — विपक्षी\n\nमुद्दाः वैदेशिक रोजगार कसूर\n\nनिवेदनबापत रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु:\n\n" +
      "1. प्रस्तुत मुद्दामा म जाहेरवाला/पीडितले प्रतिवादी {{defendantName}} बाट विगो रु. {{compensationAmount}} भराई पाउने ठहरी मिति {{judgmentDate}} मा यस न्यायाधिकरण/सर्वोच्च अदालतबाट फैसला भै अन्तिम भैसकेको छ। प्रस्तुत मुद्दामा पुर्पक्षको लागि निज प्रतिवादीले राखेको धरौटी (रसिद नं. {{depositReceiptNo}}, रकम रु. {{depositAmount}}) मेरो विगो वापतमा फिर्ता पाऊँ।\n\nसंलग्न कागजात: फैसलाको प्रतिलिपी\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमो.नं.: {{mobileNo}}\n\nमिति: {{submissionDate}}",
  },
  {
    title: "सक्कल लिखत पेस गरेको (वैदेशिक रोजगार न्यायाधिकरण)",
    category: FOREIGN_EMPLOYMENT,
    description: "न्यायाधिकरणको आदेश बमोजिम सक्कल लिखत/फोटो/अन्य प्रमाण मिसिल सामेल गरिपाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_FET_FIELDS,
      { key: "orderDate", label: "आदेश मिति", type: "date", required: true },
      { key: "documentsList", label: "पेश गरिएका सक्कल लिखत/फोटो/प्रमाणको विवरण", type: "textarea", required: true },
    ],
    bodyTemplate:
      "श्री वैदेशिक रोजगार न्यायाधिकरण, काठमाडौँमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : सक्कल लिखत पेस गरेको ।\n\nमुद्दा नं. {{caseNo}}\n\n{{petitionerName}} — निवेदक\n\nविरुद्ध\n\n{{respondentName}} — विपक्षी\n\nमुद्दाः वैदेशिक रोजगार कसूर।\n\nनिवेदनबापत रु.१०।– यसै साथ राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं:\n\n" +
      "१. उक्त मुद्दामा यस न्यायाधिकरणको मिति {{orderDate}} को आदेश बमोजिम तपसिल बमोजिमको सक्कल लिखत/फोटो/अन्य प्रमाण दाखिला गर्न ल्याएको छु। मिसिल सामेल गरी पाऊँ।\n\nतपसिल: {{documentsList}}\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमो.नं.: {{mobileNo}}\n\nमिति: {{submissionDate}}",
  },
  {
    title: "थुनामा परेको जानकारी बारे (वैदेशिक रोजगार न्यायाधिकरण)",
    category: FOREIGN_EMPLOYMENT,
    description: "अर्को मुद्दामा थुना/कैदमा परेकोले तारिखमा हाजिर हुन नसक्ने जानकारी दिने निवेदन।",
    fields: [
      ...COMMON_FET_FIELDS,
      { key: "hearingDate", label: "तारिख तोकिएको मिति", type: "date", required: true },
      { key: "otherCaseDetails", label: "जुन मुद्दामा थुना/कैद परेको हो सो को विवरण", type: "text", required: true },
      { key: "custodyStartDate", label: "थुना/कैदमा परेको मिति", type: "date", required: true },
    ],
    bodyTemplate:
      "श्री वैदेशिक रोजगार न्यायाधिकरण, काठमाडौँमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : थुनामा परेको जानकारी बारे।\n\nमुद्दा नं. {{caseNo}}\n\n{{petitionerName}} — निवेदक\n\nविरुद्ध\n\n{{respondentName}} — विपक्षी\n\nमुद्दाः {{respondentName}}\n\nनिवेदनबापत रु.१०।– साथै राखि निम्नानुसार निवेदन गर्दछुः\n\n" +
      "1. उल्लिखित मुद्दामा मलाई यस न्यायाधिकरणबाट मिति {{hearingDate}} को तारिख तोकिएको र म {{otherCaseDetails}} मुद्दामा मिति {{custodyStartDate}} देखि थुना/कैदमा परी तारिखमा हाजिर हुन नसकेकोले मुलुकी फौजदारी कार्यविधि संहिता, २०७४ को दफा ८५(२) बमोजिम थुना/कैदमा परेको व्यहोरा जानकारीको लागि अनुरोध छ।\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमो.नं.: {{mobileNo}}\n\nमिति: {{submissionDate}}",
  },
  {
    title: "जरिवानाको रकम फिर्ता पाऊँ (वैदेशिक रोजगार न्यायाधिकरण)",
    category: FOREIGN_EMPLOYMENT,
    description: "सर्वोच्च अदालतबाट सफाई/जरिवाना घटी हुने फैसला भएकोले दाखिला गरेको जरिवाना फिर्ता पाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_FET_FIELDS,
      { key: "originalJudgmentDate", label: "जरिवाना लागेको फैसला मिति", type: "date", required: true },
      { key: "paidFineAmount", label: "दाखिला गरेको जरिवाना रकम", type: "text", required: true },
      { key: "fineReceiptNo", label: "जरिवाना दाखिला रसिद नं. र मिति", type: "text" },
      { key: "refundAmount", label: "फिर्ता माग गरेको रकम", type: "text", required: true },
      { key: "refundReason", label: "फिर्ता हुनुपर्ने कारण", type: "textarea", required: true },
    ],
    bodyTemplate:
      "श्री वैदेशिक रोजगार न्यायाधिकरण, काठमाडौँमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : जरिवाना रकम फिर्ता पाउँ।\n\nमुद्दा नं. {{caseNo}}\n\n{{petitionerName}} — निवेदक\n\nविरुद्ध\n\n{{respondentName}} — विपक्षी\n\nमुद्दा– बैदेशिक रोजगार कसुर।\n\nनिवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं:\n\n" +
      "1. प्रस्तुत मुद्दामा मलाई यस न्यायाधिकरणको मिति {{originalJudgmentDate}} को फैसलाले लागेको जरिवाना रकम {{paidFineAmount}} (रसिद नं. {{fineReceiptNo}}) दाखिल गरेको थिएँ। उक्त मुद्दामा मैले अभियोग दाबीबाट सफाई पाउने गरी/जरिवाना कम हुने गरी सर्वोच्च अदालतबाट अन्तिम फैसला भएकोले मैले पाउनु पर्ने रकम रु. {{refundAmount}} फिर्ता पाउन यो निवेदन गर्दछु।\n\nफिर्ता हुनुपर्ने कारण: {{refundReason}}\n\nसंलग्न कागजात: (क) परिचय खुल्ने कागजात (ख) जरिवाना बुझाएको रसिद (ग) फैसला वा आदेशको प्रतिलिपि\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "साक्षीको सुरक्षा प्रवन्ध गरी पाउँ (वैदेशिक रोजगार न्यायाधिकरण)",
    category: FOREIGN_EMPLOYMENT,
    description: "बकपत्रपछि सुरक्षामा खतरा भएमा साक्षी(हरू)को सुरक्षा प्रबन्धको लागि निवेदन।",
    fields: [
      ...COMMON_FET_FIELDS,
      { key: "witnessDetails", label: "साक्षी(हरू) को नाम, जिल्ला, न.पा./गा.पा., वडा नं.", type: "textarea", required: true },
      { key: "threatReason", label: "सुरक्षामा खतरा हुनुको कारण", type: "textarea", required: true },
    ],
    bodyTemplate:
      "श्री वैदेशिक रोजगार न्यायाधिकरण, काठमाडौँमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : साक्षीको सुरक्षा प्रबन्ध गरी पाऊँ ।\n\nमुद्दा नं. {{caseNo}}\n\n{{petitionerName}} — निवेदक\n\nविरुद्ध\n\n{{respondentName}} — विपक्षी\n\nमुद्दा– वैदेशिक रोजगार कसूर।\n\nनिवेदनबापत रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं:\n\n" +
      "1. उल्लिखित मुद्दामा देहाएका व्यक्ति साक्षीको रुपमा रहेको र म/हामीलाई {{threatReason}} कारणले न्यायाधिकरणमा उपस्थित हुन/न्यायाधिकरणमा बकपत्र गरिसकेपछि सुरक्षामा खतरा रहेको हुनाले मुलुकी फौजदारी कार्यविधि संहिता, २०७४ को दफा ११४(१) बमोजिम सुरक्षा प्रबन्ध गरी पाऊँ।\n\nसाक्षी विवरण: {{witnessDetails}}\n\n२. लेखिएको बेहोरा ठिक साँचो हो। फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमो.नं.: {{mobileNo}}\n\nमिति: {{submissionDate}}",
  },
  {
    title: "बकपत्र गराइ पाऊँ (वैदेशिक रोजगार न्यायाधिकरण)",
    category: FOREIGN_EMPLOYMENT,
    description: "न्यायाधिकरणको आदेशबमोजिम साक्षी लिई हाजिर भई बकपत्र गराइपाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_FET_FIELDS,
      { key: "witnessList", label: "साक्षी(हरू) को नाम, वर्ष, जिल्ला, न.पा./गा.पा., वडा नं.", type: "textarea", required: true },
    ],
    bodyTemplate:
      "श्री वैदेशिक रोजगार न्यायाधिकरण, काठमाडौंमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय: बकपत्र गराइ पाऊँ।\n\nमुद्दा नं. {{caseNo}}\n\n{{petitionerName}} — निवेदक\n\nविरुद्ध\n\n{{respondentName}} — विपक्षी\n\nमुद्दा– वैदेशिक रोजगार कसूर।\n\nनिवेदनबापत रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं:\n\n" +
      "१. उल्लिखित मुद्दामा यस न्यायाधिकरणको आदेशबमोजिम मलाई/हामीलाई आफ्नो वयानमा उल्लिखित साक्षी लिई हाजिर हुन आउनु भनी आजको तारिख तोकी पाएको छु। तसर्थ तपसिलमा उल्लिखित साक्षी लिई उपस्थित भएको छु/छौं। हाजिर गराई अड्डाको तर्फबाट/आफ्नै तर्फबाट बकपत्र गराइपाऊँ।\n\nतपसिल — साक्षी विवरण: {{witnessList}}\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमो.नं.: {{mobileNo}}\n\nमिति: {{submissionDate}}",
  },
  {
    title: "प्रमाण पेस गर्न अनुमति पाऊँ (वैदेशिक रोजगार न्यायाधिकरण)",
    category: FOREIGN_EMPLOYMENT,
    description: "काबुबाहिरको परिस्थितिले प्रमाण पेस गर्न नसकेकोले अर्को तारिख तोकिपाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_FET_FIELDS,
      { key: "evidenceReason", label: "प्रमाण पेस गर्न नसकेको कारण", type: "textarea", required: true },
    ],
    bodyTemplate:
      "श्री वैदेशिक रोजगार न्यायाधिकरण, काठमाडौँमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : प्रमाण पेश गर्ने अनुमति पाऊँ।\n\nमुद्दा नं. {{caseNo}}\n\n{{petitionerName}} — निवेदक\n\nविरुद्ध\n\n{{respondentName}} — विपक्षी\n\nमुद्दाः-वैदेशिक रोजगार कसूर ।\n\nनिवेदनबापत रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछुः\n\n" +
      "1. प्रस्तुत मुद्दामा प्रमाण लाग्ने लिखत वा दसी प्रमाण उजुरी/बयान/प्रतिउत्तरपत्र साथ पेस गर्नुपर्नेमा म/हामीले उक्त प्रमाणहरू {{evidenceReason}} काबुबाहिरको परिस्थिति परी पेस गर्न नसकेको हुनाले मुलुकी फौजदारी कार्यविधि संहिता, २०७४ को दफा ९९(३) बमोजिम प्रमाण पेस गर्न अर्को तारिख तोकी पाऊँ।\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला।\n\nनिवेदक\n\nमो.नं.: {{mobileNo}}\n\nमिति: {{submissionDate}}",
  },
  {
    title: "अड्डाको रोहवरमा म्याद बुझी पाऊँ (वैदेशिक रोजगार न्यायाधिकरण)",
    category: FOREIGN_EMPLOYMENT,
    description: "आफैले उपस्थित भई अड्डाको रोहवरमा म्याद बुझिलिई हाजिर हुन पाऊँ भन्ने निवेदन।",
    fields: COMMON_FET_FIELDS,
    bodyTemplate:
      "श्री वैदेशिक रोजगार न्यायाधिकरण, काठमाडौँमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : अड्डाको रोहवरमा म्याद बुझी पाऊँ।\n\nमुद्दा नं. {{caseNo}}\n\n{{petitionerName}} — निवेदक\n\nविरुद्ध\n\n{{respondentName}} — विपक्षी\n\nमुद्दाः-वैदेशिक रोजगार कसूर ।\n\nनिवेदनबापत रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं:\n\n" +
      "१. उपर्युक्त मुद्दामा मेरो/हाम्रो नाउँमा मुलुकी फौजदारी कार्यविधि संहिता, २०७४ को दफा ११२ बमोजिम हाजिर हुन आउने आदेश भई म्याद जारी भएकाले आफैले नागरिकताको प्रतिलिपि/परिचय खुल्ने कागजात यसै साथ राखी निवेदन गरेको छु/छौं। तसर्थ मेरो/हाम्रो नामको म्याद बुझिलिई हाजिर हुन पाऊँ ।\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमो.नं.: {{mobileNo}}\n\nमिति: {{submissionDate}}",
  },
];

async function main() {
  console.log("Seeding Batch 3 — remaining 14 Foreign Employment Tribunal templates (Folder 2 completion)...");

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

  console.log(`Batch 3 complete. ${created} new template(s) created. Folder 2 (वैदेशिक रोजगार न्यायाधिकरण) is now fully done — 24/24.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
