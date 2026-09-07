import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DISTRICT_COURT = "सेवाग्राहीले जिल्ला अदालतमा पेस गर्ने निवेदनका ढाँचाहरू";

const COMMON_DC_FIELDS = [
  { key: "courtName", label: "अदालतको नाम", type: "text", autoFillSource: "court.name" },
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
    title: "फाराम नं. २ — अड्डाको रोहवरमा म्याद बुझिपाऊँ (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "आफैले उपस्थित भई अड्डाको रोहवरमा म्याद बुझिलिई हाजिर हुन पाऊँ भन्ने निवेदन।",
    fields: COMMON_DC_FIELDS,
    bodyTemplate:
      "श्री {{courtName}} जिल्ला अदालतमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : अड्डाको रोहवरमा म्याद बुझिपाऊँ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं:\n\n" +
      "1. उपर्युक्त मुद्दामा मेरो/हाम्रो नाउँमा प्रतिउत्तर पेस गर्ने/मुलुकी देवानी संहिता, २०७४ को दफा २२२(२)/मुलुकी देवानी कार्यविधि संहिता, २०७४ को दफा १००/ऐ. संहिताको दफा १२३/ऐ. संहिताको दफा २०२ बमोजिम हाजिर हुन आउने आदेश भई म्याद जारी भएकाले सो म्याद मुलुकी देवानी कार्यविधि संहिता, २०७४ को दफा १०७ बमोजिम बुझिलिन आफैं/वारिसमार्फत नागरिकताको प्रतिलिपि/परिचय खुल्ने कागजात यसैसाथ राखी निवेदन गरेको छु/छौं। तसर्थ मेरो/हाम्रो नामको म्याद बुझिलिई हाजिर हुन पाऊँ ।\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ५८ — वारेस बदर गरी तारिख सकार गरिपाऊँ (जिल्ला अदालत, फौजदारी)",
    category: DISTRICT_COURT,
    description: "वारिस राखेको मुद्दामा आफैं तारिखमा रहन चाहेकोले तारिख आफैं सकार गरिपाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_DC_FIELDS,
      { key: "attorneyName", label: "वारिस राखिएको व्यक्तिको नाम र ठेगाना", type: "text", required: true },
      { key: "assignedDate", label: "वारिसलाई तोकिएको तारिख मिति", type: "date", required: true },
    ],
    bodyTemplate:
      "श्री {{courtName}} जिल्ला अदालतमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : वारेस बदर गरी तारिख सकार गरिपाऊँ ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :\n\n" +
      "१. उक्त मुद्दामा मैले/हामीले {{attorneyName}} लाई वारिस राख्न अख्तियारनामा लेखिदिएको र निज वारिसलाई यस अदालतबाट मिति {{assignedDate}} गतेको तारिख तोकिएकोमा म/हामी आफैँ तारिखमा रहने हुँदा मुलुकी फौजदारी कार्यविधि संहिता, २०७४ को दफा ९३ बमोजिम आफ्नो मुद्दाको तारिख आफैँ सकार गरिपाऊँ।\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ४ — तारिख सकार गरिपाऊँ (जिल्ला अदालत, देवानी)",
    category: DISTRICT_COURT,
    description: "वारिस राखेको मुद्दामा आफैं तारिखमा रहन चाहेकोले तारिख आफैं सकार गरिपाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_DC_FIELDS,
      { key: "attorneyName", label: "वारिस राखिएको व्यक्तिको नाम र ठेगाना", type: "text", required: true },
      { key: "assignedDate", label: "वारिसलाई तोकिएको तारिख मिति", type: "date", required: true },
    ],
    bodyTemplate:
      "श्री {{courtName}} जिल्ला अदालतमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : तारिख सकार गरिपाऊँ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :\n\n" +
      "१. उक्त मुद्दामा मैले/हामीले {{attorneyName}} लाई वारिस राख्न अख्तियारनामा लेखिदिएको र निज वारिसलाई यस अदालतबाट मिति {{assignedDate}} गतेको तारिख तोकिएकोमा म/हामी आफैं तारिखमा रहने हुँदा मुलुकी देवानी कार्यविधि संहिता, २०७४ को दफा १५२ बमोजिम आफ्नो मुद्दाको तारिख आफैँ सकार गरिपाऊँ ।\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ४६ — मुद्दाको कारबाही रोकिपाऊँ (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "इजलासका न्यायाधीशको स्वार्थ बाझिने भएकोले मुद्दाको कारबाही र किनारा रोकिपाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_DC_FIELDS,
      { key: "benchNo", label: "इजलास नं.", type: "text", required: true },
      { key: "judgeName", label: "माननीय न्यायाधीशको नाम", type: "text", autoFillSource: "case.judge", required: true },
      { key: "conflictReason", label: "स्वार्थ बाझिने विस्तृत कारण", type: "textarea", required: true },
    ],
    bodyTemplate:
      "श्री {{courtName}} जिल्ला अदालतमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : मुद्दाको कारबाही रोकिपाऊँ।\n\nमुद्दा/रिट नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :\n\n" +
      "1. उल्लिखित मुद्दा सम्मानित अदालतमा कारबाहीयुक्त अवस्थामा रही इजलास नं. {{benchNo}} मा पेसी चढेको रहेछ। उक्त इजलासका माननीय न्यायाधीश श्री {{judgeName}} को निम्न कारणले गर्दा प्रस्तुत मुद्दासँग स्वार्थ बाझिने भएको हुँदा मुलुकी फौजदारी कार्यविधि संहिता, २०७४ को दफा १७६(३) बमोजिम मुद्दाको कारबाही र किनारा रोकिपाऊँ।\n\nस्वार्थ बाझिने कारणः {{conflictReason}}\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. १७ — प्रो बोनो सेवा उपलब्ध गराइपाऊँ (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "असहाय/अशक्त/नाबालक/आर्थिकरूपमा विपन्न वा थुनामा रहेकोले स्वेच्छिक कानूनी सहायता (प्रो बोनो) उपलब्ध गराई पाउने निवेदन।",
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
      "श्री {{courtName}} मा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : प्रो बोनो सेवा उपलब्ध गराइपाऊँ ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n{{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "म/हामी निम्नानुसार निवेदन गर्दछु/गर्दछौं :–\n\n" +
      "१. म/हामी असहाय/अशक्त/नाबालक/आर्थिकरूपमा विपन्न वा थुनामा रहेकोले स्वेच्छिक कानूनी सहायता (प्रो बोनो सेवा) उपलब्ध गराई पाउन यो निवेदन गरेको छु/छौं। जिल्ला अदालत नियमावली, २०७५ को नियम १०४ बमोजिम स्वेच्छिक कानूनी सेवा (प्रो बोनो सेवा) उपलब्ध गराइपाऊँ।\n\nसंलग्न कागजात: (क) {{attachedDoc1}} (ख) {{attachedDoc2}}\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ४९ — बढी रोक्का रहेको सम्पत्ति फुकुवा गरिपाऊँ (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "रोक्का राख्नुपर्ने भन्दा बढी सम्पत्ति रोक्का राखिएकोले बढी रोक्का सम्पत्ति फुकुवा गरिपाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_DC_FIELDS,
      { key: "nationalIdNo", label: "राष्ट्रिय परिचयपत्र नं.", type: "text" },
      { key: "propertyDetails", label: "रोक्का रहेको सम्पत्तिको विवरण (आदेश निकाय/मिति)", type: "textarea", required: true },
      { key: "excessPropertyDetails", label: "बढी रोक्का राखिएको फुकुवा माग गरिएको सम्पत्तिको विवरण", type: "textarea", required: true },
    ],
    bodyTemplate:
      "श्री {{courtName}} जिल्ला अदालतमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : बढी रोक्का रहेको सम्पत्ति फुकुवा गरिपाऊँ ।\n\nमुद्दा नं. {{caseNo}}\nराष्ट्रिय परिचयपत्र नं.: {{nationalIdNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :–\n\n" +
      "1. उक्त मुद्दामा रोक्का राख्नुपर्ने सम्पत्तिभन्दा बढी सम्पत्ति रोक्का राखिएको हुनाले बढी रोक्का राखिएको देहायको सम्पत्ति मुलुकी फौजदारी कार्यविधि संहिता, २०७४ को दफा १५६(३) बमोजिम फुकुवा गरिपाऊँ।\n\nरोक्का रहेको सम्पत्तिको विवरण: {{propertyDetails}}\nबढी रोक्का राखिएको फुकुवा माग गरिएको सम्पत्तिको विवरण: {{excessPropertyDetails}}\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ४७ — गुज्रेको तारिख थामिपाऊँ (जिल्ला अदालत, फौजदारी)",
    category: DISTRICT_COURT,
    description: "काबुबाहिरको परिस्थितिले तारिखमा उपस्थित हुन नसकी तारिख गुज्रन गएकोले सो थामिपाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_DC_FIELDS,
      { key: "assignedDate", label: "तोकिएको तारिख मिति", type: "date", required: true },
      { key: "lapseReason", label: "तारिख गुज्रनुको कारण", type: "textarea", required: true },
    ],
    bodyTemplate:
      "श्री {{courtName}} जिल्ला अदालतमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : गुज्रेको तारिख थामिपाऊँ।\n\nमुद्दा/रिट नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :\n\n" +
      "१. उल्लिखित मुद्दामा यस अदालतबाट मिति {{assignedDate}} गतेको तारिख तोकी पाएको थिएँ/थियौं। उक्त मितिमा अदालतमा उपस्थित भै तारिख लिनुपर्नेमा {{lapseReason}} भई तारिख गुज्रन गयो। तसर्थ मुलुकी फौजदारी कार्यविधि संहिता, २०७४ को दफा १६८(३) बमोजिम गुज्रेको तारिख थामिपाऊँ। आवश्यक प्रमाण यसैसाथ छ ।\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला/बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ७० — जरिवानाको रकम फिर्ता पाऊँ (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "सफाई/जरिवाना घटी हुने अन्तिम फैसला भएकोले दाखिला गरेको जरिवाना फिर्ता पाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_DC_FIELDS,
      { key: "fineAmount", label: "बुझाएको जरिवानाको अङ्क", type: "text", required: true },
      { key: "receiptNo", label: "रसिद नं. र मिति", type: "text" },
      { key: "refundAmount", label: "फिर्ता माग गरेको रकम", type: "text", required: true },
      { key: "refundReason", label: "फिर्ता हुनुपर्ने कारण", type: "textarea", required: true },
    ],
    bodyTemplate:
      "श्री {{courtName}} जिल्ला अदालतमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : जरिवानाको रकम फिर्ता पाऊँ ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :–\n\n" +
      "१. उक्त मुद्दामा मैले/हामीले यस अदालतमा राखेको जरिवाना रकम {{fineAmount}} (रसिद नं. {{receiptNo}}) बुझाएकोमा अभियोग दाबीबाट सफाइ पाउने गरी/जरिवाना कम हुने गरी अन्तिम फैसला भएकाले मैले/हामीले पाउनुपर्ने रकम रु. {{refundAmount}} फिर्ता पाउन यो निवेदन गर्दछु/छौं। मुलुकी फौजदारी कार्यविधि संहिता, २०७४ को दफा ७६(२) बमोजिम फिर्ता पाऊँ।\n\nफिर्ता हुनुपर्ने कारण: {{refundReason}}\n\nसंलग्न कागजात: (क) परिचय खुल्ने कागजात (ख) जरिवाना बुझाएको रसिद (भएमा) (ग) फैसला वा आदेशको प्रतिलिपि\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
];

async function main() {
  console.log("Seeding Batch 7 — District Court templates (8 more)...");

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

  console.log(`Batch 7 complete. ${created} new template(s) created. जिल्ला अदालत folder: 42/73 done — more remain.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
