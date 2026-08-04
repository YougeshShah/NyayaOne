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
    title: "फाराम नं. २८ — तारिखमा नबस्ने अनुमति पाऊँ (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "प्रमाण बुझ्ने कार्य सम्पन्न भएकोले तारिखमा नबस्ने अनुमतिको लागि निवेदन (देवानी दफा १३५)।",
    fields: [
      { key: "petitionerName", label: "निवेदक (वादी/प्रतिवादी)", type: "text", autoFillSource: "client.fullName", required: true },
      { key: "respondentName", label: "विपक्षी (प्रतिवादी/वादी)", type: "text", autoFillSource: "case.opposingParty" },
      { key: "caseNo", label: "मुद्दा नं.", type: "text", autoFillSource: "case.caseNumber" },
      { key: "caseSubject", label: "मुद्दा", type: "text", autoFillSource: "case.category" },
      { key: "courtName", label: "जिल्ला अदालतको नाम", type: "text", autoFillSource: "court.name" },
      { key: "submissionDate", label: "मिति", type: "date", autoFillSource: "today" },
    ],
    bodyTemplate:
      "अनुसूची-७ (मुलुकी देवानी कार्यविधि नियमावली, २०७५ नियम २४ को उपनियम (१) सँग सम्बन्धित)\n\nश्री {{courtName}} जिल्ला अदालतमा पेस गरेको\n\nनिवेदन पत्र\n\nविषयः तारिखमा नबस्ने अनुमति पाऊँ ।\n\nमुद्दा नं. {{caseNo}} — मुद्दाः {{caseSubject}}\n\n{{petitionerName}} — निवेदक/वादी/प्रतिवादी\n\nविरुद्ध\n\n{{respondentName}} — विपक्षी/वादी/प्रतिवादी\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं:–\n\n" +
      "1. म {{petitionerName}} वादी/प्रतिवादी भएको प्रस्तुत मुद्दामा प्रमाण बुझ्ने कार्य सम्पन्न भइसकेको र अब मलाई तारिखमा नबस्ने चाहना भएको हुँदा मुलुकी देवानी कार्यविधि संहिता, २०७४ को दफा १३५ को उपदफा (२) बमोजिम तारिखमा नबस्ने अनुमतिका लागि यो निवेदन पेस गरेको छु। मुद्दाको कारबाहीसम्बन्धी जानकारी मेरो कानून व्यवसायी वा अदालतको वेबसाइटलगायतका अन्य कुनै माध्यमबाट म स्वयंले लिने छु। मुद्दाको कारबाहीको क्रममा अदालतले उपस्थित हुनु भनी आदेश दिएमा जुनसुकै बखत उपस्थित हुने बेहोरासमेत अनुरोध गर्दछु।\n2. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ४८ — बिगो क्षतिपूर्ति वा अन्य कुनै रकमबापत कैद गरिपाऊँ (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "फैसलाबमोजिम भराई पाउने रकम नबुझाएकोले, सम्पत्ति पत्ता नलागेकोले, बाँकी रकमको दिन-दरले कैदमा राखिपाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_DC_FIELDS,
      { key: "judgmentDate", label: "फैसला मिति", type: "date", required: true },
      { key: "judgmentCourt", label: "फैसला गर्ने अदालत", type: "text", required: true },
      { key: "totalAwardedAmount", label: "भराई पाउने ठहरेको जम्मा रकम रु.", type: "text", required: true },
      { key: "amountUnpaid", label: "हालसम्म नबुझाएको/बाँकी रकम रु.", type: "text", required: true },
      { key: "amountRecovered", label: "लिलाम/असुल भएको रकम (भए)", type: "text" },
      { key: "custodyDays", label: "कैद हुनुपर्ने दिन संख्या", type: "text", required: true },
    ],
    bodyTemplate:
      "श्री {{courtName}} जिल्ला अदालतमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : बिगो क्षतिपूर्ति वा अन्य कुनै रकमबापत कैद गरिपाऊँ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :–\n\n" +
      "1. उक्त मुद्दा मिति {{judgmentDate}} मा {{judgmentCourt}} अदालतबाट अन्तिम फैसला हुँदा म/हामी वादी/प्रतिवादीले रु. {{totalAwardedAmount}} बिगो/क्षतिपूर्ति/अन्य रकम भराई पाउने ठहरी फैसला भएको र उक्त फैसलाअनुसार निज वादी/प्रतिवादीले तिर्न बुझाउनुपर्ने रकम हालसम्म नबुझाएको/निजको नाममा रहेको जायजेथा लिलाम गर्दा रु. {{amountRecovered}} असुल भई रु. {{amountUnpaid}} बाँकी रहेको/रकम भराई पाउने व्यक्तिले सम्पत्ति पत्ता लगाउन नसकिएको हुनाले उक्त बुझाउन बाँकी रहेको रु. {{amountUnpaid}} को एकदिनको तीनसयका रुपैयाँका दरले {{custodyDays}} दिन मुलुकी फौजदारी कार्यविधि संहिता, २०७४ को दफा १६५(७) बमोजिम कैदमा राखिपाऊँ।\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. १५ — बेरितको म्याद बदर गरिपाऊँ (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "रीत नपुर्‍याई तामेल भएको म्याद/सूचना बदर गरी पुनः तामेल गरिपाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_DC_FIELDS,
      { key: "noticeIssueDate", label: "म्याद/सूचना जारी भएको मिति", type: "date", required: true },
      { key: "cpcSection", label: "मु.दे.का.सं. दफा १०५ को उपदफा नं.", type: "text" },
      { key: "attachedDoc1", label: "संलग्न कागजात (क)", type: "text" },
      { key: "attachedDoc2", label: "संलग्न कागजात (ख)", type: "text" },
    ],
    bodyTemplate:
      "श्री {{courtName}} जिल्ला अदालतमा चढाएको\n\nनिवेदन पत्र\n\nविषय : बेरितको म्याद बदर गरिपाऊँ ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :–\n\n" +
      "1. उल्लिखित मुद्दामा मेरो/हाम्रो नाममा यस अदालतबाट मिति {{noticeIssueDate}} मा जारी भएको म्याद/सूचना तामेल गर्दा मुलुकी देवानी कार्यविधि संहिता, २०७४ को दफा १०५({{cpcSection}}) बमोजिमको रीत नपुर्‍याई तामेल भएको उक्त म्याद मुलुकी देवानी कार्यविधि संहिता, २०७४ को दफा ११७ बमोजिम बदर गरी पुनः म्याद तामेल गरिपाऊँ।\n\nसंलग्न कागजात: (क) {{attachedDoc1}} (ख) {{attachedDoc2}}\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ५ — म्याद, सूचना प्रकाशन/प्रसारण गरी तामेल गरिपाऊँ (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "म्याद रीतपूर्वक तामेल हुन नसकेकोले राष्ट्रिय स्तरका दैनिक पत्रिकामा प्रकाशित गरी तामेल गरिपाऊँ भन्ने निवेदन।",
    fields: [...COMMON_DC_FIELDS, { key: "respondentDetails2", label: "म्याद जारी गर्नुपर्ने अर्को विपक्षीको विवरण (भए)", type: "textarea" }],
    bodyTemplate:
      "श्री {{courtName}} जिल्ला अदालतमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : म्याद, सूचना प्रकाशन/प्रशारण गरी तामेल गरिपाऊँ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :\n\n" +
      "१. उपर्युक्त मुद्दामा तपसिलका प्रतिवादीको नामको म्याद रीतपूर्वक तामेल हुन नसकेको भनी तामेलदारले अदालतमा प्रतिवेदन दिएको हुनाले निजका नाममा यस अदालतबाट मुलुकी देवानी कार्यविधि संहिता, २०७४ को दफा १०५(२२) र मुलुकी फौजदारी कार्यविधि संहिता, २०७४ को दफा ६२(१) बमोजिम राष्ट्रिय स्तरका दैनिक पत्रिकामा प्रकाशित गरिपाऊँ। साथै यसरी म्याद तामेल गर्दा लाग्ने दस्तुर तोकिएबमोजिम म आफैंले बुझाउने छु ।\n\n" +
      "अर्को विपक्षीको विवरण (भए): {{respondentDetails2}}\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. २६ — छुट प्रमाण पेस गरेको बारे (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "फिराद/प्रतिउत्तर दर्ता गर्दा पेस गर्न छुट भएको प्रमाण पेसी तारिख अगावै पेस गर्ने निवेदन।",
    fields: [...COMMON_DC_FIELDS, { key: "missedEvidenceDetails", label: "छुट भएको प्रमाणको विवरण र कारण", type: "textarea", required: true }],
    bodyTemplate:
      "श्री {{courtName}} जिल्ला अदालतमा चढाएको\n\nनिवेदन पत्र\n\nविषय : छुट प्रमाण पेस गरेको बारे ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :–\n\n" +
      "1. उल्लिखित मुद्दामा प्रमाण लाग्ने निम्न कागज {{missedEvidenceDetails}} कारणले फिराद/प्रतिउत्तर दर्ता गर्दा पेस गर्न छुट भएको हुनाले पेसी तारिख अघि नै जिल्ला अदालत नियमावली, २०७५ को नियम ४७ बमोजिम छुट प्रमाण पेस गरेको छु। मिसिल सामेल राखिपाऊँ।\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ११ — गुज्रेको तारिख थामिपाऊँ (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "काबुबाहिरको परिस्थितिले तारिख गुज्रन गएकोले सो तारिख थामिपाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_DC_FIELDS,
      { key: "assignedDate", label: "तोकिएको तारिख मिति", type: "date", required: true },
      { key: "lapsedDaysDetail", label: "गुज्रेको दिन र कारण (विस्तृत)", type: "textarea", required: true },
    ],
    bodyTemplate:
      "श्री {{courtName}} जिल्ला अदालतमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : गुज्रेको तारिख थामिपाऊँ ।\n\nमुद्दा/रिट नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :\n\n" +
      "१. उक्त मुद्दामा सम्मानित अदालतबाट मलाई/हामीलाई मिति {{assignedDate}} गतेको तारिख तोकी पाएकोमा काबुबाहिरको परिस्थिति परी अदालतमा उपस्थित भै तारिख लिन नसकी सो तारिख गुज्रिन गएकोले निम्नबमोजिमको तारिख थामिपाऊँ ।\n\n" +
      "गुज्रेको दिन र कारण: {{lapsedDaysDetail}}\n\n(संक्षिप्त कार्यविधि ऐन, २०२८ को दफा ८(१) / विशेष अदालत ऐन, २०५९ को दफा ११ / मुलुकी देवानी कार्यविधि संहिता, २०७४ को दफा २२३, २२५ / जिल्ला अदालत नियमावली, २०७५ को नियम ३८ बमोजिम)\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला/बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ६४ — अदालती शुल्क भराइपाऊँ (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "मुद्दा जितेकोले राखेको अदालती शुल्क हार्ने पक्षबाट भराई पाउने निवेदन।",
    fields: [
      ...COMMON_DC_FIELDS,
      { key: "paidReceiptNo", label: "अदालती शुल्क बुझाएको र.नं.", type: "text" },
      { key: "paidDate", label: "बुझाएको मिति", type: "date", required: true },
      { key: "paidAmount", label: "बुझाएको रकम रु.", type: "text", required: true },
      { key: "judgmentDate", label: "फैसला मिति", type: "date", required: true },
      { key: "losingParty", label: "मुद्दा हार्ने पक्षको नाम", type: "text", required: true },
    ],
    bodyTemplate:
      "श्री {{courtName}} जिल्ला अदालतमा चढाएको\n\nनिवेदन पत्र\n\nविषय : अदालती शुल्क भराइपाऊँ ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :–\n\n" +
      "1. उल्लिखित मुद्दामा म/हामीले र.नं. {{paidReceiptNo}} मिति {{paidDate}} मा अदालती शुल्क रु. {{paidAmount}} बुझाएकोमा उक्त मुद्दा मिति {{judgmentDate}} मा फैसला भई मुद्दा अन्तिम भएको र उक्त मुद्दा मैले जितेको हुनाले मैले राखेको अदालती शुल्क मुलुकी देवानी कार्यविधि संहिता, २०७४ को दफा ८३ बमोजिम मुद्दा हार्ने पक्ष {{losingParty}} बाट भराइपाऊँ।\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. १८ — सक्कल लिखत पेस गरेको (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "अदालतको आदेशबमोजिम सक्कल लिखत/फोटो/अन्य प्रमाण दाखिला गरी मिसिल सामेल गरिपाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_DC_FIELDS,
      { key: "orderDate", label: "आदेश मिति", type: "date", required: true },
      { key: "documentsList", label: "पेश गरिएका सक्कल लिखत/फोटो/प्रमाणको विवरण", type: "textarea", required: true },
    ],
    bodyTemplate:
      "श्री {{courtName}} जिल्ला अदालतमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : सक्कल लिखत पेस गरेको ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :–\n\n" +
      "१. उक्त मुद्दामा मुलुकी देवानी कार्यविधि संहिता, २०७४ को दफा १६५(३) बमोजिम/मुलुकी फौजदारी कार्यविधि संहिता, २०७४ को दफा १००(४) बमोजिम सम्मानित अदालतको मिति {{orderDate}} को आदेशबमोजिम तपसिलबमोजिमको सक्कल लिखत/फोटो/अन्य प्रमाण दाखिला गर्न ल्याएको छु। मिसिल सामेल गराइपाऊँ ।\n\nतपसिल: {{documentsList}}\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
];

async function main() {
  console.log("Seeding Batch 6 — District Court templates (8 more)...");

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

  console.log(`Batch 6 complete. ${created} new template(s) created. जिल्ला अदालत folder: 34/73 done — more remain.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
