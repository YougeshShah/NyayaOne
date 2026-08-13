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
    title: "फाराम नं. ५६ — तारिखमा नबस्ने अनुमति पाऊँ (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "प्रमाण बुझ्ने काम सम्पन्न भएकोले तारिखमा नबस्ने अनुमति माग गर्ने निवेदन।",
    fields: [...COMMON_DC_FIELDS, { key: "filingDate", label: "मुद्दा दायर भएको मिति", type: "date", required: true }],
    bodyTemplate:
      "श्री {{courtName}} जिल्ला अदालतमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : तारिखमा नबस्ने अनुमति पाऊँ ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :–\n\n" +
      "1. उल्लिखित मुद्दा मिति {{filingDate}} मा दायर भई कारबाहीको अवस्थामा रहेको र म/हामी तारिखमा बस्दै आएकोमा प्रमाण बुझ्ने काम सम्पन्न भएको हुनाले मुलुकी फौजदारी कार्यविधि संहिता, २०७४ को दफा ८८(१) बमोजिम तारिखमा नबस्ने अनुमति पाऊँ।\n2. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ४३ — दशीको सामान फिर्ता पाऊँ (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "आम्दानीमा बाँधिएका दशीका जिन्सी सामान फिर्ता पाउने आदेश भएकोले फिर्ता पाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_DC_FIELDS,
      { key: "orderDate", label: "फिर्ता आदेश मिति", type: "date", required: true },
      { key: "itemsDetails", label: "सामानको विवरण", type: "textarea", required: true },
    ],
    bodyTemplate:
      "श्री {{courtName}} जिल्ला अदालतमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : दशीको सामान फिर्ता पाऊँ ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु :\n\n" +
      "१. उपरोक्त मुद्दामा अभियोगपत्र साथ सम्मानित अदालतमा पेस भई आम्दानीमा बाँधिएका दशीका जिन्सी सामानहरू मुलुकी फौजदारी कार्यविधि नियमावली, २०७५ को नियम १४ बमोजिम फिर्ता दिनु भन्ने मिति {{orderDate}} मा आदेश भएकोले फिर्ता पाऊँ।\n\nसामानको विवरण: {{itemsDetails}}\n\nसंलग्न कागजात: (क) परिचय खुल्ने कागजातको प्रतिलिपि (ख) जिल्ला सरकारी वकिल कार्यालयको पत्र\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ४५ — मुद्दा सकार गर्न अनुमति पाऊँ (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "पक्ष मृत्यु/वेपत्ता/होस ठेगाना नभएकोले गुज्रेको म्याद थामी मुद्दा सकार गर्न अनुमति माग्ने निवेदन।",
    fields: [
      ...COMMON_DC_FIELDS,
      { key: "reasonType", label: "कारण (मृत्यु/वेपत्ता/होस ठेगाना नभएको)", type: "text", required: true },
      { key: "reasonDate", label: "सो घटना भएको मिति", type: "date", required: true },
    ],
    bodyTemplate:
      "श्री {{courtName}} जिल्ला अदालतमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : मुद्दा सकार गर्न अनुमति पाऊँ ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :\n\n" +
      "1. प्रस्तुत मुद्दा कैद वा जरिवानाको सजाय नहुने प्रकृतिको मुद्दा भएको र सम्मानित अदालतमा दर्ता भई कारबाहीयुक्त अवस्थामा रहेको छ। {{reasonType}} मिति {{reasonDate}} भएको हुनाले तोकिएको म्याद/तारिख गुज्रन गएको हुनाले गुज्रेको म्याद/तारिख थामी मुलुकी फौजदारी कार्यविधि संहिता, २०७४ को दफा १९० बमोजिम मुद्दा सकार गर्न अनुमति पाऊँ।\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ९ — नक्कल निवेदन (जिल्ला अदालत)",
    category: DISTRICT_COURT,
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
      "श्री {{courtName}} अदालतमा पेस गरेको\n\nनक्कलको निवेदन पत्र\n\nमुद्दा नं. {{caseNo}} — मुद्दाः {{caseSubject}}\n\n{{petitionerName}} — निवेदक/वादी/प्रतिवादी\n\nविरुद्ध\n\n{{respondentName}} — वादी/प्रतिवादी\n\n" +
      "म निवेदक मुलुकी देवानी कार्यविधि संहिता, २०७४ को दफा ४६/मुलुकी फौजदारी कार्यविधि संहिता, २०७४ को दफा १७५ बमोजिम निम्नबमोजिमको लिखत/प्रमाणको नक्कल अदालतको/आफ्नै तर्फबाट सारी लिन पाऊँ भनी नियमबमोजिमको दस्तुर साथै राखी निवेदन गर्दछु :\n\n" +
      "नक्कल माग गरेका लिखत/प्रमाण: {{requestedDocuments}}\n\nयसमा लेखिएको बेहोरा ठिक साँचो छ झुट्टा ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. २२ — मुद्दा मुलतबीमा राखिपाऊँ (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "अन्तरप्रभावी अर्को मुद्दा फैसला नहुन्जेल हालको मुद्दा मुलतबीमा राख्न दिने निवेदन।",
    fields: [
      ...COMMON_DC_FIELDS,
      { key: "relatedCourt", label: "सम्बन्धित अदालत", type: "text", required: true },
      { key: "relatedPlaintiff", label: "सो मुद्दाका वादी", type: "text" },
      { key: "relatedDefendant", label: "सो मुद्दाका प्रतिवादी", type: "text" },
      { key: "relatedCaseYear", label: "सो मुद्दा दर्ता साल", type: "text" },
      { key: "relatedCaseNo", label: "सो मुद्दाको मु.नं.", type: "text" },
      { key: "relatedCaseSubject", label: "सो मुद्दाको विषय", type: "text" },
      { key: "otherReason", label: "अन्य कारण (ख)", type: "textarea" },
    ],
    bodyTemplate:
      "श्री {{courtName}} जिल्ला अदालतमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : मुद्दा मुलतबीमा राखिपाऊँ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :–\n\n" +
      "१. प्रस्तुत मुद्दा सम्मानित अदालतमा दायर भई कारबाहीयुक्त अवस्थामा रहेको छ। निम्न कारण परेकोले उल्लिखित मुद्दा मुलुकी देवानी कार्यविधि संहिता, २०७४ को दफा २०१ बमोजिम मुलतबीमा राखिपाऊँ।\n\n" +
      "मुलतबी रहनुपर्ने कारण\n(क) {{relatedCourt}} अदालतमा कारबाहीयुक्त अवस्थामा रहेको वादी {{relatedPlaintiff}} प्रतिवादी {{relatedDefendant}} भएको {{relatedCaseYear}} सालको मु.नं. {{relatedCaseNo}} को {{relatedCaseSubject}} मुद्दा प्रस्तुत मुद्दासँग अन्तरप्रभावी रहेकाले सो मुद्दा फैसला नहुन्जेलसम्मका लागि\n(ख) {{otherReason}}\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ६ — वतन खुलाएको (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "म्याद रीतपूर्वक तामेल हुन नसकेकोले विपक्षीको अर्को वतन खुलाई म्याद जारी गरिपाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_DC_FIELDS,
      { key: "newAddress1Details", label: "नयाँ वतन (क) — जिल्ला/न.पा./वडा/गाउँ/घर नं./नाम/फोन/इमेल", type: "textarea", required: true },
      { key: "newAddress2Details", label: "नयाँ वतन (ख) (भए)", type: "textarea" },
    ],
    bodyTemplate:
      "श्री {{courtName}} जिल्ला अदालतमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : वतन खुलाएको ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :\n\n" +
      "१. उक्त मुद्दामा मैले फिरादपत्र, रिट निवेदनमा उल्लेख गरेको बयान कागजमा खुलाएको वतनमा विपक्षीका नाउँमा सम्मानित अदालतबाट जारी भएको म्याद रीतपूर्वक तामेल हुन नसकी मुलुकी देवानी कार्यविधि संहिता, २०७४ को दफा १७१(२), ऐ.दफा २७५ र मुलुकी फौजदारी कार्यविधि नियमावली, २०७५ को नियम ८९ बमोजिम अर्को वतन खुलाउनु भन्ने आदेशानुसार तपसिलको वतन खुलाएको छु। सोहीबमोजिमको वतनमा म्याद जारी गरिपाऊँ।\n\n" +
      "वतन (क): {{newAddress1Details}}\nवतन (ख): {{newAddress2Details}}\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. १३ — यथास्थितिमा राखिपाऊँ (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "विपक्षीले सम्पत्तिको भौतिक स्वरुप बिगार्न लागेकोले मुद्दा किनारा नभएसम्म यथास्थितिमा राख्न दिने निवेदन।",
    fields: [
      ...COMMON_DC_FIELDS,
      { key: "immovablePropertyDetails", label: "यथास्थितिमा राख्नुपर्ने अचल सम्पत्तिको विवरण", type: "textarea", required: true },
      { key: "movablePropertyDetails", label: "चल सम्पत्तिको विवरण", type: "textarea" },
    ],
    bodyTemplate:
      "श्री {{courtName}} जिल्ला अदालतमा चढाएको\n\nनिवेदन पत्र\n\nविषय : यथास्थितिमा राखिपाऊँ ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :–\n\n" +
      "१. उल्लिखित मुद्दामा मेरो/हाम्रो दाबी भएको सम्पत्तिमा विपक्षीले भौतिक स्वरुप बिगार्न लागेको हुँदा मुलुकी देवानी कार्यविधि संहिता, २०७४ को दफा १५६ बमोजिम मुद्दा किनारा नभएसम्म यथास्थितिमा राखिपाऊँ। आवश्यक प्रमाण कागज यसैसाथ छ।\n\n" +
      "यथास्थितिमा राख्नुपर्ने सम्पत्तिको विवरण:\n(क) अचल सम्पत्ति: {{immovablePropertyDetails}}\n(ख) चल सम्पत्ति: {{movablePropertyDetails}}\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ५० — रकम भुक्तान गरी कैदबाट छुटकारा पाऊँ (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "एक वर्ष वा सोभन्दा कम सजाय भएकोले तोकिएको रकम दाखिला गरी कैदबाट छुटकारा पाउने निवेदन।",
    fields: [
      ...COMMON_DC_FIELDS,
      { key: "judgmentDate", label: "फैसला मिति", type: "date", required: true },
      { key: "sentenceDetails", label: "सजायको अवधि (कैद)", type: "text", required: true },
      { key: "nationality", label: "राष्ट्रियता (देश)", type: "text", required: true },
      { key: "totalDays", label: "कैद बाँकी दिन संख्या", type: "text", required: true },
      { key: "totalAmount", label: "दाखिला गर्नुपर्ने जम्मा रकम रु.", type: "text", required: true },
    ],
    bodyTemplate:
      "श्री {{courtName}} जिल्ला अदालतमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय: रकम भुक्तान गरी कैदबाट छुटकारा पाऊँ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :–\n\n" +
      "1. उल्लिखित मुद्दा मुलुकी फौजदारी कार्यविधि संहिता, २०७४ को दफा १५९(४) अन्तर्गतको कसुर नभएको साथै एक वर्ष वा सोभन्दा कम सजाय हुने कसुर भएको र सम्मानित अदालतबाट मिति {{judgmentDate}} मा फैसला हुँदा मलाई/हामीलाई {{sentenceDetails}} कैद सजाय भएको छ। म/हामी {{nationality}} देशको नागरिक भएको हुनाले प्रतिदिन कैदको रु.पाँचसयका दरले {{totalDays}} दिनको हुन आउने जम्मा रु. {{totalAmount}} दाखिला गरी मुलुकी फौजदारी कार्यविधि संहिता, २०७४ को दफा १५५(५) बमोजिम कैदबाट छुटकारा पाऊँ।\n2. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ६१ — प्रमाण पेस गर्न अनुमति पाऊँ (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "काबुबाहिरको परिस्थितिले प्रमाण पेस गर्न नसकेकोले अर्को तारिख तोकिपाऊँ भन्ने निवेदन।",
    fields: [...COMMON_DC_FIELDS, { key: "evidenceReason", label: "प्रमाण पेस गर्न नसकेको कारण", type: "textarea", required: true }],
    bodyTemplate:
      "श्री {{courtName}} जिल्ला अदालतमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : प्रमाण पेस गर्न अनुमति पाऊँ ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :–\n\n" +
      "1. प्रस्तुत मुद्दामा प्रमाण लाग्ने लिखत वा दसी प्रमाण उजुरी/बयान/प्रतिउत्तर पत्रसाथ पेस गर्नुपर्नेमा म/हामीले उक्त प्रमाणहरू {{evidenceReason}} काबुबाहिरको परिस्थिति परी पेस गर्न नसकेको हुनाले मुलुकी फौजदारी कार्यविधि संहिता, २०७४ को दफा ९९(३) बमोजिम प्रमाण पेस गर्न अर्को तारिख तोकिपाऊँ।\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. १२ — गुज्रेको म्याद थामिपाऊँ (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "काबुबाहिरको परिस्थितिले हाजिर हुन नसकी म्याद गुज्रन गएकोले म्याद थामिपाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_DC_FIELDS,
      { key: "summonServedDate", label: "म्याद तामेल मिति", type: "date", required: true },
      { key: "deadlineDate", label: "हाजिर हुनुपर्ने मिति", type: "date", required: true },
      { key: "lapseReason", label: "म्याद गुज्रनुको कारण", type: "textarea", required: true },
    ],
    bodyTemplate:
      "श्री {{courtName}} जिल्ला अदालतमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : गुज्रेको म्याद थामिपाऊँ ।\n\nमुद्दा/रिट नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :\n\n" +
      "1. उक्त मुद्दामा सम्मानित अदालतबाट म/हामीका नाममा जारी भएको म्याद मिति {{summonServedDate}} मा तामेल भई मिति {{deadlineDate}} सम्ममा हाजिर हुनुपर्नेमा मलाई/हामीलाई {{lapseReason}} कारणले काबुबाहिरको परिस्थिति परी अदालतमा हाजिर हुन नसकी सो म्याद गुज्रिन गएकोले मुलुकी देवानी कार्यविधि संहिता, २०७४ को दफा २२३/जिल्ला अदालत नियमावली, २०७५ को नियम ३८ बमोजिम गुज्रेको म्याद थामिपाऊँ।\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला/बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ३२ — मिलापत्रको जानकारी गराइपाऊँ (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "पक्षहरू बिच मिलापत्र भएकोले सम्बन्धित निकायलाई जनाउ पुर्जी गरिपाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_DC_FIELDS,
      { key: "settlementDate", label: "मिलापत्र मिति", type: "date", required: true },
      { key: "settlementTerms", label: "मिलापत्रको बेहोरा", type: "textarea", required: true },
    ],
    bodyTemplate:
      "श्री {{courtName}} जिल्ला अदालतमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : मिलापत्रको जानकारी गराइपाऊँ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :–\n\n" +
      "१. उपर्युक्त मुद्दा सम्मानित अदालतमा दायर भई हामीहरूबिच {{settlementTerms}} बेहोराबाट मिति {{settlementDate}} मा मिलापत्र भएकाले मिलापत्रबमोजिम गरिदिनु भनी सम्बन्धित अड्डाका नाममा मुलुकी देवानी कार्यविधि संहिता, २०७४ को दफा १९३(६) बमोजिम जनाउ पुर्जी गरिपाऊँ।\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ४० — माथवर नियुक्त/प्रमाणित गरिपाऊँ (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "नाबालक/होस ठेगानामा नभएका व्यक्तिको माथवर नियुक्ति/प्रमाणित गरिपाऊँ भन्ने निवेदन।",
    fields: [
      { key: "courtName", label: "अदालतको नाम", type: "text", autoFillSource: "court.name" },
      { key: "petitionerName", label: "निवेदकको नाम, थर", type: "text", autoFillSource: "client.fullName", required: true },
      { key: "petitionerAge", label: "निवेदकको उमेर", type: "text", required: true },
      { key: "petitionerAddress", label: "निवेदकको ठेगाना", type: "text", autoFillSource: "client.address", required: true },
      { key: "relationToWard", label: "नाबालक/होस ठेगाना नभएको व्यक्तिसँगको नाता", type: "text" },
      { key: "petitionerParents", label: "निवेदकका बाबु, आमाको नाम", type: "text" },
      { key: "proposedGuardianName", label: "माथवर नियुक्त गर्न प्रस्तावित व्यक्तिको नाम, थर", type: "text", required: true },
      { key: "proposedGuardianAge", label: "प्रस्तावित माथवरको उमेर", type: "text" },
      { key: "proposedGuardianAddress", label: "प्रस्तावित माथवरको ठेगाना", type: "text" },
      { key: "wardName", label: "नाबालक/होस ठेगाना नभएको व्यक्तिको नाम", type: "text", required: true },
      { key: "wardAge", label: "निजको उमेर", type: "text" },
      { key: "wardAddress", label: "निजको ठेगाना", type: "text" },
      { key: "purpose", label: "माथवर नियुक्ति/प्रमाणितको प्रयोजन", type: "textarea", required: true },
      { key: "submissionDate", label: "मिति", type: "date", autoFillSource: "today" },
    ],
    bodyTemplate:
      "अनुसूची-३७ (मुलुकी देवानी कार्यविधि नियमावली, २०७५ नियम ६५ को उपनियम (१) सँग सम्बन्धित)\n\nश्री {{courtName}} जिल्ला अदालतमा पेस गरेको\n\nनिवेदन पत्र\n\nविषयः माथवर नियुक्त/प्रमाणित गरिपाऊँ ।\n\n" +
      "{{petitionerName}} — निवेदक, उमेर {{petitionerAge}}, ठेगाना {{petitionerAddress}}\n\n" +
      "मुलुकी देवानी संहिता, २०७४ को परिच्छेद-७ बमोजिम देहायका नाबालक/होस ठेगानामा नभएका व्यक्तिको माथवर नियुक्ति गरिपाऊँ/माथवर प्रमाणित गरिपाऊँ भनी निम्न विवरणसहित निवेदन गर्दछु। उक्त संहिताको दफा १४१ बमोजिम म माथवर नियुक्त हुन अयोग्य नभएको बेहोरासमेत अनुरोध गर्दछु। लाग्ने दस्तुर रु. ५००।- यसै साथ संलग्न छ ।\n\n" +
      "(१) निवेदकको नाता (नाबालक/होस ठेगाना नभएको व्यक्तिसँग): {{relationToWard}} | बाबु, आमाको नाम: {{petitionerParents}}\n\n" +
      "(२) माथवर नियुक्त गर्न प्रस्तावित व्यक्तिः नाम {{proposedGuardianName}}, उमेर {{proposedGuardianAge}}, ठेगाना {{proposedGuardianAddress}}\n\n" +
      "(३) नाबालक/होस ठेगानामा नभएको व्यक्तिः नाम {{wardName}}, उमेर {{wardAge}}, ठेगाना {{wardAddress}}\n\n" +
      "(४) माथवर नियुक्ति/प्रमाणितको प्रयोजनः {{purpose}}\n\n" +
      "यस निवेदनपत्रको बेहोरा ठिक साँचो छ, झुट्टा बेहोरा लेखिएको ठहरे कानूनबमोजिम सजाय सहुँला बुझाउँला।\n\nनिवेदकको दस्तखत\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ६३ — फैसला कार्यान्वयन स्थगित गरिपाऊँ (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "फैसलाउपर पुनरावेदन दर्ता भई कारबाहीयुक्त अवस्थामा रहेकोले फैसला कार्यान्वयन स्थगित गरिपाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_DC_FIELDS,
      { key: "judgmentDate", label: "फैसला मिति", type: "date", required: true },
      { key: "appealCourt", label: "पुनरावेदन दर्ता भएको अदालत", type: "text", required: true },
      { key: "appealDate", label: "पुनरावेदन दर्ता मिति", type: "date", required: true },
    ],
    bodyTemplate:
      "श्री {{courtName}} जिल्ला अदालतमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय: फैसला कार्यान्वयन स्थगित गरिपाऊँ ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :–\n\n" +
      "1. उल्लिखित मुद्दा सम्मानित अदालतबाट मिति {{judgmentDate}} मा फैसला भएको र उक्त फैसलाउपर मेरो/हाम्रो चित्त नबुझेको हुनाले {{appealCourt}} अदालतमा मिति {{appealDate}} मा पुनरावेदन दर्ता भई कारबाहीयुक्त अवस्थामा रहेको हुनाले फैसला कार्यान्वयनको कार्य स्थगन गरी पाउन मुलुकी फौजदारी कार्यविधि संहिता, २०७४ को दफा १५३(२) बमोजिम पुनरावेदन परेको जानकारीको लागि निवेदन दिएको छु/छौं। फैसला कार्यान्वयनको कार्य स्थगन गरिपाऊँ।\n2. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. २९ — धरौट तारेख पाऊँ (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "पुनः इन्साफको लागि पठाइएको मुद्दाको सक्कल मिसिल प्राप्त नभएकोले धरौट तारेखमा रहन पाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_DC_FIELDS,
      { key: "originalCourt", label: "मुद्दा पठाउने अदालत", type: "text", required: true },
      { key: "assignedDate", label: "तारिख तोकिएको मिति", type: "date", required: true },
    ],
    bodyTemplate:
      "श्री {{courtName}} जिल्ला अदालतमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : धरौट तारेख पाऊँ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौ :\n\n" +
      "१. उल्लिखित मुद्दा {{originalCourt}} अदालतबाट पुनः इन्साफको लागि/पुनरावेदन दर्ता भई सम्मानित अदालतमा पठाउने गरी फैसला/आदेश भई आज मिति {{assignedDate}} को तारिख तोकी हाजिर हुन जानु भनी पठाएकोमा उक्त मुद्दाको सक्कल मिसिल प्राप्त हुन नआएकाले मुलुकी देवानी कार्यविधि संहिता, २०७४ को दफा १३५ बमोजिम/मुलुकी फौजदारी कार्यविधि संहिता, २०७४ को दफा ६९ बमोजिम हाललाई धरौट तारेखमा रहन पाऊँ। तारिख पर्चाको प्रतिलिपि यसैसाथ छ ।\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ५२ — घा जाँच गराइपाऊँ (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "हिरासतमा रहँदा कुटपिट/यातना भएकोले घा जाँच गराइपाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_DC_FIELDS,
      { key: "custodyStartDate", label: "हिरासतमा परेको मिति", type: "date", required: true },
      { key: "injuryReason", label: "जाँच गराउनुपर्ने कारण (कुटपिट/यातना/अन्य)", type: "textarea", required: true },
    ],
    bodyTemplate:
      "श्री {{courtName}} जिल्ला अदालतमा चढाएको\n\nनिवेदन पत्र\n\nविषय : घा जाँच गराइपाऊँ ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :–\n\n" +
      "1. उल्लिखित मुद्दा म/हामी मिति {{custodyStartDate}} गतेदेखि अनुसन्धानको क्रममा पक्राउ परी प्रहरी हिरासतमा रहेका छु/छौं। हिरासतमा रहदा म/हामीलाई {{injuryReason}} भएको हुनाले मुलुकी फौजदारी कार्यविधि संहिता, २०७४ को दफा २२(२) बमोजिम घा जाँच गराइपाऊँ।\n2. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
];

async function main() {
  console.log("Seeding Batch 4 — District Court templates (first 15 of 70+)...");

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

  console.log(`Batch 4 complete. ${created} new template(s) created. जिल्ला अदालत folder: 15/70+ done — many more remain.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
