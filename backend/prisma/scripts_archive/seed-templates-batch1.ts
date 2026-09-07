import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * COMMON_PARTY_FIELDS — the petitioner/respondent block repeats almost
 * identically across nearly every Supreme Court फाराम. Defining it once here
 * and spreading it into each template avoids re-typing the same 12 fields
 * for every single document.
 */
const COMMON_PARTY_FIELDS = [
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
  { key: "caseNo", label: "मुद्दा/रिट नं.", type: "text", autoFillSource: "case.caseNumber" },
  { key: "caseSubject", label: "मुद्दा", type: "text", autoFillSource: "case.category" },
  { key: "submissionDate", label: "मिति", type: "date", autoFillSource: "today" },
];

const templates = [
  {
    title: "फाराम नं. १९ — मुद्दा मुलतबीमा राखिपाऊँ",
    category: "निवेदन (देवानी)",
    description: "अन्तरप्रभावी अर्को मुद्दा फैसला नहुन्जेल हालको मुद्दा मुलतबीमा राख्न दिने निवेदन।",
    fields: [
      ...COMMON_PARTY_FIELDS,
      { key: "relatedCourt", label: "सम्बन्धित अदालत (जहाँ अर्को मुद्दा विचाराधीन छ)", type: "text", required: true },
      { key: "relatedPlaintiff", label: "सो मुद्दाका वादी", type: "text" },
      { key: "relatedDefendant", label: "सो मुद्दाका प्रतिवादी", type: "text" },
      { key: "relatedCaseYear", label: "सो मुद्दा दर्ता साल", type: "text" },
      { key: "relatedCaseNo", label: "सो मुद्दाको मु.नं.", type: "text" },
      { key: "relatedCaseSubject", label: "सो मुद्दाको विषय", type: "text" },
      { key: "otherReason", label: "अन्य कारण (ख)", type: "textarea" },
    ],
    bodyTemplate:
      "श्री सर्वोच्च अदालत, काठमाडौँमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : मुद्दा मुलतबीमा राखिपाऊँ।\n\nमुद्दा नं.- {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\n" +
      "विरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\n" +
      "मुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :–\n\n" +
      "१. प्रस्तुत मुद्दा सम्मानित अदालतमा दायर भई कारबाहीयुक्त अवस्थामा रहेको छ। निम्न कारण परेकोले उल्लिखित मुद्दा मुलुकी देवानी कार्यविधि संहिता, २०७४ को दफा २०१ बमोजिम मुलतबीमा राखिपाऊँ।\n\n" +
      "मुलतबी रहनुपर्ने कारण\n\n" +
      "(क) {{relatedCourt}} अदालतमा कारबाहीयुक्त अवस्थामा रहेको वादी {{relatedPlaintiff}} प्रतिवादी {{relatedDefendant}} भएको {{relatedCaseYear}} सालको मु.नं. {{relatedCaseNo}} को {{relatedCaseSubject}} मुद्दा प्रस्तुत मुद्दासँग अन्तरप्रभावी रहेकाले सो मुद्दा फैसला नहुन्जेलसम्मका लागि\n\n" +
      "(ख) {{otherReason}}\n\n" +
      "२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ३८ — साक्षीको सुरक्षा प्रबन्ध गरिपाऊँ",
    category: "निवेदन (फौजदारी)",
    description: "बकपत्र गरेपछि सुरक्षामा खतरा भएमा साक्षीको सुरक्षा प्रबन्धको लागि निवेदन।",
    fields: [
      ...COMMON_PARTY_FIELDS,
      { key: "witnessNames", label: "साक्षी(हरू) को नाम", type: "text", required: true },
      { key: "threatReason", label: "सुरक्षामा खतरा हुनुको कारण", type: "textarea", required: true },
    ],
    bodyTemplate:
      "श्री सर्वोच्च अदालत, काठमाडौँमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : साक्षीको सुरक्षा प्रबन्ध गरिपाऊँ ।\n\nमुद्दा नं.- {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\n" +
      "विरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\n" +
      "मुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :–\n\n" +
      "1. उल्लिखित मुद्दामा म {{witnessNames}} साक्षीको रुपमा रहेको र मलाई {{threatReason}} कारणले अदालतमा उपस्थित हुन/अदालतमा बकपत्र गरिसकेपछि मलाई सुरक्षामा खतरा रहेको हुनाले मुलुकी फौजदारी कार्यविधि संहिता, २०७४ को दफा ११४(१) बमोजिम सुरक्षा प्रबन्ध गरिपाऊँ।\n" +
      "2. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. १२ — बेरीतको म्याद बदर गरिपाऊँ",
    category: "निवेदन (देवानी)",
    description: "रीत नपुर्‍याई तामेल भएको म्याद/सूचना बदर गरी पुनः तामेल गरिपाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_PARTY_FIELDS,
      { key: "noticeIssueDate", label: "म्याद/सूचना जारी भएको मिति", type: "date", required: true },
      { key: "cpcSection", label: "मु.दे.का.सं. दफा १०५ को उपदफा नं.", type: "text" },
      { key: "attachedDoc1", label: "संलग्न कागजात (क)", type: "text" },
      { key: "attachedDoc2", label: "संलग्न कागजात (ख)", type: "text" },
    ],
    bodyTemplate:
      "श्री सर्वोच्च अदालत, काठमाडौँमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : बेरितको म्याद बदर गरिपाऊँ ।\n\nमुद्दा नं.- {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\n" +
      "विरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\n" +
      "मुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :–\n\n" +
      "1. उल्लिखित मुद्दामा मेरो/हाम्रो नाममा यस अदालतबाट मिति {{noticeIssueDate}} मा जारी भएको म्याद/सूचना तामेल गर्दा मुलुकी देवानी कार्यविधि संहिता, २०७४ को दफा १०५({{cpcSection}}) बमोजिमको रीत नपुर्‍याई तामेल भएको उक्त म्याद मुलुकी देवानी कार्यविधि संहिता, २०७४ को दफा ११७ बमोजिम बदर गरी पुनः म्याद तामेल गरिपाऊँ।\n\n" +
      "संलग्न कागजात\nक. {{attachedDoc1}}\nख. {{attachedDoc2}}\n\n" +
      "२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "नियम ६२ बमोजिमको आदेश जारी गरी पाउँ (nibedan-52)",
    category: "निवेदन (सर्वोच्च अदालत नियमावली)",
    description: "अर्को मुद्दामा भएको आदेश/निर्णय आफ्नो हकमा समेत आकर्षित हुने भएकोले सोही बमोजिम आदेश माग गर्ने निवेदन।",
    fields: [
      { key: "petitionerName", label: "निवेदकको नाम", type: "text", autoFillSource: "client.fullName", required: true },
      { key: "petitionerAddress", label: "निवेदकको ठेगाना", type: "text", autoFillSource: "client.address", required: true },
      { key: "relatedPetitioner", label: "सम्बन्धित रिट निवेदक/पुनरावेदक", type: "text" },
      { key: "relatedRespondent", label: "सम्बन्धित विपक्षी/प्रत्यर्थी", type: "text" },
      { key: "relatedCaseYear", label: "सो मुद्दाको साल", type: "text" },
      { key: "relatedCaseNo", label: "सो मुद्दा नं.", type: "text" },
      { key: "caseSummary", label: "निरूपण भएको मुद्दाको संक्षिप्त बेहोरा", type: "textarea", required: true },
      { key: "mainIssue", label: "उक्त मुद्दामा निरूपण भएको मुख्य विषय र प्रश्न", type: "textarea" },
      { key: "attractionBasis", label: "उक्त निर्णय आफ्नो हकमा समेत आकर्षित हुने आधार र कारण", type: "textarea", required: true },
      { key: "precedentCited", label: "अदालतबाट प्रतिपादित सिद्धान्त / नजीर", type: "textarea" },
      { key: "petitionDemand", label: "निवेदकको माग दावी", type: "textarea", required: true },
      { key: "implementingBody", label: "माग गरेको विषयको कार्यान्वयन गर्नुपर्ने निकाय", type: "text" },
      { key: "submissionDate", label: "मिति", type: "date", autoFillSource: "today" },
    ],
    bodyTemplate:
      "श्री सर्वोच्च अदालतमा चढाएको\n\nनिवेदनपत्र\n\nविषय : सर्वोच्च अदालत नियमावली, २०७४ को नियम ६२ वमोजिमको आदेश जारी गरी पाउँ।\n\n" +
      "म निवेदक {{petitionerName}} बस्ने {{petitionerAddress}} ले सम्मानित सर्वोच्च अदालतबाट रिट निवेदक/पुनरावेदक {{relatedPetitioner}} र विपक्षी/प्रत्यर्थी {{relatedRespondent}} भएको {{relatedCaseYear}} मुद्दा नं. {{relatedCaseNo}} को मुद्दामा भएको आदेश/निर्णय मेरो हकमा समेत आकर्षित हुने भएकोले सर्वोच्च अदालत नियमावली, २०७४ को नियम ६२ को उपनियम (१) वमोजिम देहायको निवेदन पेश गरेको छु :\n\n" +
      "1. निवेदनको संक्षिप्त बेहोरा : {{caseSummary}}\n\n" +
      "उक्त मुद्दामा निरूपण भएको मुख्य विषय र प्रश्न : {{mainIssue}}\n\n" +
      "2. निवेदकले उल्लेख गरेको मुद्दामा अदालतबाट प्रतिपादित सिद्धान्त / नजीर : {{precedentCited}}\n\n" +
      "3. निवेदकको माग दावी : {{petitionDemand}}\n\n" +
      "4. निवेदकले माग गरेको विषयको कार्यान्वयन गर्नुपर्ने निकाय : {{implementingBody}}\n\n" +
      "5. उक्त निर्णय आफ्नो हकमा समेत आकर्षित हुने आधार र कारण : {{attractionBasis}}\n\n" +
      "6. माथि उल्लेख गरिएको मुद्दासँग सम्बन्धित विषयमा परस्पर फरक फरक सिद्धान्त प्रतिपादन भएको छैन। साथै, उक्त फैसला/नजिर वदर भएको समेत छैन ।\n\n" +
      "माथि लेखिएको बेहोरा सही साँचो हो फरक ठहरे कानून वमोजिम सहुला बुझाउला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. १७ — संशोधन गरिपाऊँ",
    category: "निवेदन (देवानी/फौजदारी)",
    description: "पुनरावेदनपत्र/रिट निवेदन/लिखित जवाफमा टाइप/लेखाइको त्रुटि सच्याउन लिखत संशोधन गरिपाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_PARTY_FIELDS,
      { key: "errorContent", label: "लिखतमा भएको त्रुटिको बेहोरा", type: "text" },
      { key: "errorPageNo", label: "पाना नं.", type: "text" },
      { key: "errorLineNo", label: "हरफ", type: "text" },
      { key: "correctedContent", label: "संशोधन हुनुपर्ने बेहोरा", type: "textarea", required: true },
    ],
    bodyTemplate:
      "श्री सर्वोच्च अदालत, काठमाडौँमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : संशोधन गरिपाऊँ।\n\nमुद्दा नं.- {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\n" +
      "विरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\n" +
      "मुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :\n\n" +
      "1. उल्लिखित मुद्दामा मैले पेस गरेका पुनरावेदनपत्र/रिट निवेदन/लिखित जवाफमा तपसिलमा उल्लेख भए अनुसारको टाइप/लेखाइको भुलबाट त्रुटि हुन गएको हुँदा सोको सट्टा तपसिलमा उल्लेख भएबमोजिमको बेहोरा कायम हुने गरी मुलुकी देवानी कार्यविधि नियमावली, २०७५ को नियम १४ र सर्वोच्च अदालत नियमावली, २०७४ को नियम १९ बमोजिम लिखत संशोधन गरिपाऊँ ।\n\n" +
      "त्रुटिको बेहोरा: {{errorContent}} | पाना नं.: {{errorPageNo}} | हरफ: {{errorLineNo}}\nसंशोधन हुनुपर्ने बेहोरा: {{correctedContent}}\n\n" +
      "२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ४४ — रोक्का रहेको सम्पत्ति फुकुवा गरिपाऊँ",
    category: "निवेदन (फौजदारी/देवानी)",
    description: "रोक्का रहेको जग्गा/सम्पत्ति फुकुवा गरिपाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_PARTY_FIELDS,
      { key: "nationalIdNo", label: "राष्ट्रिय परिचयपत्र नं.", type: "text" },
      { key: "releaseReason", label: "फुकुवा हुनुपर्ने विस्तृत कारण", type: "textarea", required: true },
      { key: "propertyDetails", label: "रोक्का रहेको सम्पत्तिको विवरण", type: "textarea", required: true },
      { key: "propertyLocation", label: "जग्गाको जिल्ला/न.पा./गा.पा./वडा/कि.नं.", type: "textarea" },
      { key: "attachedDocs", label: "संलग्न कागजात", type: "textarea" },
    ],
    bodyTemplate:
      "श्री सर्वोच्च अदालत, काठमाडौँमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : रोक्का रहेको सम्पत्ति फुकुवा गरिपाऊँ ।\n\nमुद्दा नं.- {{caseNo}}\nराष्ट्रिय परिचयपत्र नं.: {{nationalIdNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\n" +
      "विरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\n" +
      "मुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :\n\n" +
      "1. उक्त मुद्दामा {{releaseReason}} भएकोले देहायको सम्पत्ति रोक्का राख्न नपर्ने हुँदा मुलुकी फौजदारी कार्यविधि नियमावली, २०७५ को नियम ९२(२) तथा मुलुकी देवानी कार्यविधि संहिता, २०७५ को दफा १५६ बमोजिम रोक्का रहेको जग्गा फुकुवा गरिपाऊँ।\n\n" +
      "रोक्का रहेको सम्पत्तिको विवरण: {{propertyDetails}}\nस्थान (जिल्ला/न.पा./गा.पा./वडा/कि.नं.): {{propertyLocation}}\n\n" +
      "संलग्न कागजात: {{attachedDocs}}\n\n" +
      "२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ८ — दस्तुर दाखिला गरेको",
    category: "निवेदन (देवानी/फौजदारी)",
    description: "अदालतबाट दस्तुर लिई हाजिर हुन तारिख तोकिएकोमा दस्तुर दाखिला गरेको जनाउने निवेदन।",
    fields: [
      ...COMMON_PARTY_FIELDS,
      { key: "courtFeeShortfall", label: "नपुग अदालती शुल्क रु.", type: "text" },
      { key: "expertTestFee", label: "विशेषज्ञ/वैज्ञानिक परीक्षण रु.", type: "text" },
      { key: "publicationFee", label: "म्याद/सूचना प्रकाशन दस्तुर रु.", type: "text" },
      { key: "otherFee", label: "अन्य दस्तुर रु.", type: "text" },
      { key: "voucherNo", label: "बैंक दाखिला भौचर नं.", type: "text" },
    ],
    bodyTemplate:
      "श्री सर्वोच्च अदालत, काठमाडौँमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : दस्तुर दाखिला गरेको।\n\nमुद्दा नं.- {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\n" +
      "विरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\n" +
      "मुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :–\n\n" +
      "१. उल्लिखित मुद्दामा मलाई सम्मानित अदालतबाट दस्तुर लिई हाजिर हुन आउनु भनी तारिख तोकी पाएकोमा देहायबमोजिमको दस्तुर लिई हाजिर हुन आएको छु ।\n\n" +
      "मुलुकी देवानी कार्यविधि संहिता, २०७४ को दफा ७७ बमोजिम नपुग अदालती शुल्क रु. {{courtFeeShortfall}}\n" +
      "विशेषज्ञ/वैज्ञानिक परीक्षण रु. {{expertTestFee}}\n" +
      "म्याद, सूचना प्रकाशन दस्तुर रु. {{publicationFee}}\n" +
      "अन्य दस्तुर रु. {{otherFee}}\n" +
      "बैंक दाखिला गरेको भौचर नं. {{voucherNo}}\n\n" +
      "२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ३१ — मुद्दाको कारबाही रोकिपाऊँ",
    category: "निवेदन (फौजदारी)",
    description: "इजलासका न्यायाधीशको स्वार्थ बाझिने भएकोले मुद्दाको कारबाही र किनारा रोकिपाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_PARTY_FIELDS,
      { key: "benchNo", label: "इजलास नं.", type: "text", required: true },
      { key: "judgeName", label: "माननीय न्यायाधीशको नाम", type: "text", autoFillSource: "case.judge", required: true },
      { key: "conflictReason", label: "स्वार्थ बाझिने विस्तृत कारण", type: "textarea", required: true },
    ],
    bodyTemplate:
      "श्री सर्वोच्च अदालत, काठमाडौँमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : मुद्दाको कारबाही रोकिपाऊँ।\n\nमुद्दा/रिट नं.- {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\n" +
      "विरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\n" +
      "मुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :\n\n" +
      "1. उल्लिखित मुद्दा सम्मानित अदालतमा कारबाहीयुक्त अवस्थामा रही इजलास नं. {{benchNo}} मा पेसी चढेको रहेछ। उक्त इजलासका माननीय न्यायाधीश श्री {{judgeName}} को निम्न कारणले गर्दा प्रस्तुत मुद्दासँग स्वार्थ बाझिने भएको हुँदा मुलुकी फौजदारी कार्यविधि संहिता, २०७४ को दफा १७६(३) बमोजिम मुद्दाको कारबाही र किनारा रोकिपाऊँ।\n\n" +
      "स्वार्थ बाझिने कारणः {{conflictReason}}\n\n" +
      "२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला/बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ४३ — कारणी उपस्थित गराएको",
    category: "निवेदन (देवानी/फौजदारी)",
    description: "तारेख तोकिएबमोजिम आफ्नो पक्ष/कारणीलाई उपस्थित गराएको जनाउने निवेदन।",
    fields: [
      ...COMMON_PARTY_FIELDS,
      { key: "hearingDate", label: "उपस्थित गराउनु भनिएको मिति", type: "date" },
      { key: "presentedPersonName", label: "उपस्थित गराइएको पक्ष/कारणीको नाम", type: "text", required: true },
    ],
    bodyTemplate:
      "श्री सर्वोच्च अदालत, काठमाडौंमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : कारणी उपस्थित गराएको ।\n\nमुद्दा/रिट नं.- {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\n" +
      "विरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\n" +
      "मुद्दा– {{caseSubject}} ।\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु :–\n\n" +
      "१. उल्लिखित मुद्दामा मुलुकी देवानी कार्यविधि संहिता, २०७४ को दफा १७२(६) बमोजिम/छलफलका निमित्त आज मिति {{hearingDate}} गते कारणीलाई उपस्थित गराउनु भनी तारेख तोकी पाएबमोजिम यसै निवेदनसाथ आफ्नो पक्ष/कारणी {{presentedPersonName}} लाई उपस्थित गराएको छु। कानूनबमोजिम गरिपाउँ ।\n\n" +
      "२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ४१ — मुद्दा मुलतबीमा राखिपाऊँ (फौजदारी)",
    category: "निवेदन (फौजदारी)",
    description: "अन्तरप्रभावी अर्को मुद्दा फैसला नहुन्जेल हालको फौजदारी मुद्दा मुलतबीमा राख्न दिने निवेदन।",
    fields: [
      ...COMMON_PARTY_FIELDS,
      { key: "relatedCourt", label: "सम्बन्धित अदालत", type: "text", required: true },
      { key: "relatedPlaintiff", label: "सो मुद्दाका वादी", type: "text" },
      { key: "relatedDefendant", label: "सो मुद्दाका प्रतिवादी", type: "text" },
      { key: "relatedCaseYear", label: "सो मुद्दा दर्ता साल", type: "text" },
      { key: "relatedCaseNo", label: "सो मुद्दाको मु.नं.", type: "text" },
      { key: "relatedCaseSubject", label: "सो मुद्दाको विषय", type: "text" },
      { key: "otherReason", label: "अन्य कारण (ख)", type: "textarea" },
    ],
    bodyTemplate:
      "श्री सर्वोच्च अदालत, काठमाडौँमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : मुद्दा मुलतबीमा राखिपाऊँ।\n\nमुद्दा नं.- {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\n" +
      "विरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\n" +
      "मुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :–\n\n" +
      "१. प्रस्तुत मुद्दा सम्मानित अदालतमा दायर भै कारबाहीयुक्त अवस्थामा छ । निम्न कारण परेकोले उल्लिखित मुद्दा मुलुकी फौजदारी कार्यविधि संहिता, २०७४ को दफा ९७(१) बमोजिम मुलतबीमा राखिपाऊँ।\n\n" +
      "मुलतबी रहनुपर्ने कारण\n\n" +
      "(क) {{relatedCourt}} अदालतमा कारबाहीयुक्त अवस्थामा रहेको वादी {{relatedPlaintiff}} प्रतिवादी {{relatedDefendant}} भएको {{relatedCaseYear}} सालको मु.नं. {{relatedCaseNo}} को {{relatedCaseSubject}} मुद्दा प्रस्तुत मुद्दासँग अन्तरप्रभावी रहेकाले सो मुद्दा फैसला नहुन्जेलसम्मका लागि ।\n\n" +
      "(ख) {{otherReason}}\n\n" +
      "२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
];

async function main() {
  console.log("Seeding Batch 1 — Supreme Court petition form templates (Folder 1, 9 forms)...");

  const admin = await prisma.user.findFirst({ where: { accountType: "COMPANY" } });
  if (!admin) {
    console.error("No COMPANY user found — run the main seed script first (npm run prisma:seed).");
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

  console.log(`Batch 1 complete. ${created} new template(s) created.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
