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
    title: "फाराम नं. ६८ — अदालती शुल्क फिर्ता पाऊँ (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "मिलापत्र भएकोले फिर्ता पाउने ठहरेको अदालती शुल्क फिर्ता पाउने निवेदन।",
    fields: [
      ...COMMON_DC_FIELDS,
      { key: "settlementDate", label: "मिलापत्र मिति", type: "date", required: true },
      { key: "refundAmount", label: "फिर्ता पाउने अदालती शुल्क रु.", type: "text", required: true },
    ],
    bodyTemplate:
      "श्री {{courtName}} जिल्ला अदालतमा पेस भएको\n\nनिवेदन पत्र\n\nविषय : अदालती शुल्क फिर्ता पाऊँ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौँ :–\n\n" +
      "१. उक्त मुद्दा मिति {{settlementDate}} मा मिलापत्र भएको र सो मिलापत्रअनुसार मैले/हामीले फिर्ता पाउने ठहरेको अदालती शुल्क रु. {{refundAmount}} मुलुकी देवानी कार्यविधि संहिता, २०७४ को दफा ८२ बमोजिम फिर्ता पाऊँ। आवश्यक कागजात यसैसाथ छ।\n\n" +
      "संलग्न कागजात: क) मिलापत्रको प्रतिलिपि ख) नागरिकता वा पहिचान खुल्ने कागजातको प्रतिलिपि ग) अघि रकम बुझाएको भए रसिदको प्रतिलिपि\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ६५ — चलन हटक गरेकोले पुनः चलन चलाइपाऊँ (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "अन्तिम फैसलाबमोजिम चलन पाई पुर्जी लिई चलन गर्न जाँदा विपक्षीले बाधा दिएकोले पुनः चलन चलाई पाउने दरखास्त।",
    fields: [
      { key: "petitionerName", label: "दरखास्तवाला (वादी/प्रतिवादी)", type: "text", autoFillSource: "client.fullName", required: true },
      { key: "respondentName", label: "विपक्षी (प्रतिवादी/वादी)", type: "text", autoFillSource: "case.opposingParty" },
      { key: "caseSubject", label: "मुद्दा (चलन मुद्दा)", type: "text", autoFillSource: "case.category" },
      { key: "originalCourt", label: "फैसला गर्ने अदालत", type: "text", required: true },
      { key: "judgmentDate", label: "अन्तिम फैसला मिति", type: "date", required: true },
      { key: "possessionDate", label: "चलन पुर्जी लिई चलन गर्न गएको मिति", type: "date", required: true },
      { key: "propertyDetails", label: "पुनः चलन चलाइ पाउने घर/जग्गा/पसल/कबलको विवरण", type: "textarea", required: true },
      { key: "submissionDate", label: "मिति", type: "date", autoFillSource: "today" },
    ],
    bodyTemplate:
      "श्री {{courtName}} जिल्ला अदालतमा पेस गरेको\n\nदरखास्त\n\nविषय : चलन हटक गरेकोले पुनः चलन चलाइपाऊँ।\n\n{{petitionerName}} — दरखास्तवाला वादी/प्रतिवादी\n\nविरुद्ध\n\n{{respondentName}} — विपक्षी प्रतिवादी/वादी\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :–\n\n" +
      "१. वादी/प्रतिवादी म/हामी {{caseSubject}} मुद्दामा {{originalCourt}} अदालतको मिति {{judgmentDate}} को अन्तिम फैसला बमोजिम चलन पाउने ठहरेकोले तपसिलमा उल्लिखित घर/जग्गा/पसल मुलुकी देवानी कार्यविधि संहिता, २०७४ को दफा २३८(५) बमोजिम सम्पूर्ण कानूनी प्रक्रिया पूरा गरी मिति {{possessionDate}} मा चलन पुर्जीसमेत लिई उल्लिखित सम्पत्ति चलन गर्न जाँदा विपक्षीले बाधा अवरोध खडा गरी चलन गर्न नदिएकोले मुलुकी देवानी कार्यविधि संहिता, २०७४ को दफा २३८(१६) बमोजिम प्रस्तुत दरखास्त गर्न आएको छु/छौं ।\n\n" +
      "२. अतः तपसिलमा उल्लिखित फैसला तथा चलन पुर्जीअनुसार म/हामी वादी/प्रतिवादीले चलन पाउने ठहरेको घर/जग्गा/पसल कवल आदि पुनः चलन चलाइपाऊँ।\n\nतपसिल — पुनः चलन चलाई पाउने विवरण: {{propertyDetails}}\n\nसंलग्न कागजात: क) फैसलाका प्रमाणित प्रतिलिपिहरू ख) अदालतबाट भएका नक्सा मुचुल्काको प्रमाणित प्रतिलिपिहरू ग) नक्सा प्रिन्टहरू घ) अन्य कागजातहरू\n\n३. यसमा लेखिएको बेहोरा ठिक साँचो छ झुट्टा फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nदरखास्तवाला\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ३४ — सम्पत्ति रोक्का राखिपाऊँ (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "विपक्षीले दाबी गरेको सम्पत्ति हक हस्तान्तरण गर्ने सम्भावना रहेकोले सम्पत्ति रोक्का राख्न दिने निवेदन।",
    fields: [
      ...COMMON_DC_FIELDS,
      { key: "nationalIdNo", label: "राष्ट्रिय परिचयपत्र नं.", type: "text" },
      { key: "filingDate", label: "मुद्दा दायर भएको मिति", type: "date", required: true },
      { key: "immovablePropertyDetails", label: "रोक्का राख्नुपर्ने अचल सम्पत्तिको विवरण", type: "textarea", required: true },
      { key: "movablePropertyDetails", label: "चल सम्पत्तिको विवरण", type: "textarea" },
    ],
    bodyTemplate:
      "श्री {{courtName}} जिल्ला अदालतमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : सम्पत्ति रोक्का राखिपाऊँ ।\n\nमुद्दा नं. {{caseNo}}\nराष्ट्रिय परिचयपत्र नं.: {{nationalIdNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :–\n\n" +
      "1. उल्लिखित विपक्षीउपर मैले मिति {{filingDate}} मा प्रस्तुत मुद्दा दायर गरी हाल विचाराधीन अवस्थामा रहेको छ। मैले/हामीले दाबी गरेको सम्पत्ति अन्य व्यक्तिहरूलाई हक हस्तान्तरण गर्ने सम्भावना रहेको छ। उक्त सम्पत्ति हक हस्तान्तरण भई गएमा मेरो हकमा असर पर्ने भएकोले तपसिलबमोजिमको सम्पत्ति कुनै पनि बेहोराले हक हस्तान्तरण, धितो बन्धकसमेत राख्न नपाउने गरी मुलुकी देवानी संहिता, २०७४ को दफा २३० बमोजिम रोक्का राखिपाऊँ। आवश्यक प्रमाण कागज यसैसाथ छ ।\n\n" +
      "रोक्का राख्नु पर्ने सम्पत्तिको विवरण:\n(क) अचल सम्पत्ति: {{immovablePropertyDetails}}\n(ख) चल सम्पत्ति: {{movablePropertyDetails}}\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ६६ — रोक्का रहेको सम्पत्ति फुकुवा गरिपाऊँ (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "अनावश्यक रोक्का रहेको सम्पत्ति फुकुवा गरिपाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_DC_FIELDS,
      { key: "nationalIdNo", label: "राष्ट्रिय परिचयपत्र नं.", type: "text" },
      { key: "releaseReason", label: "फुकुवा हुनुपर्ने कारण", type: "textarea", required: true },
      { key: "propertyDetails", label: "रोक्का रहेको सम्पत्तिको विवरण (आदेश निकाय/मिति/कारण)", type: "textarea", required: true },
      { key: "immovablePropertyDetails", label: "फुकुवा माग गरिएको अचल सम्पत्तिको विवरण", type: "textarea", required: true },
    ],
    bodyTemplate:
      "श्री {{courtName}} जिल्ला अदालतमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : रोक्का रहेको सम्पत्ति फुकुवा गरिपाऊँ ।\n\nमुद्दा नं. {{caseNo}}\nराष्ट्रिय परिचयपत्र नं.: {{nationalIdNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :\n\n" +
      "1. {{releaseReason}} भएकोले उक्त मुद्दामा देहायको सम्पत्ति रोक्का राख्न नपर्ने हुँदा मुलुकी फौजदारी कार्यविधि नियमावली, २०७५ को नियम ९२(२) तथा मुलुकी देवानी कार्यविधि संहिता, २०७५ को दफा १५६ बमोजिम रोक्का रहेको जग्गा फुकुवा गरिपाऊँ।\n\n" +
      "रोक्का रहेको सम्पत्तिको विवरण: {{propertyDetails}}\nफुकुवा माग गरिएको अचल सम्पत्तिको विवरण: {{immovablePropertyDetails}}\n\nसंलग्न कागजात: रोक्का राखेको पत्रको प्रतिलिपि भए सो कागजात\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ५१ — श्रव्य दृश्यमार्फत साक्षी बुझिपाऊँ (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "साक्षी शारीरिक रूपमा अशक्त/बालबालिका/सुरक्षाको कारणले उपस्थित हुन नसक्ने भएकोले श्रव्य दृश्यमार्फत बकपत्र गराइपाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_DC_FIELDS,
      { key: "witnessDetails", label: "साक्षी(हरू)को नाम, जिल्ला, न.पा./गा.पा., वडा नं., उमेर", type: "textarea", required: true },
      { key: "unavailabilityReason", label: "उपस्थित हुन नसक्ने कारण (शारीरिक अशक्तता/बालबालिका/सुरक्षा)", type: "text", required: true },
    ],
    bodyTemplate:
      "श्री {{courtName}} जिल्ला अदालतमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : श्रव्य दृश्यमार्फत साक्षी बुझिपाऊँ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :–\n\n" +
      "१. उल्लिखित मुद्दामा सम्मानित अदालतको आदेशबमोजिम आफ्नो फिरादपत्र र प्रतिउत्तरपत्र/बयानको प्रमाण खण्डमा उल्लिखित साक्षी लिई हाजिर हुन आउनु भनी मलाई/हामीलाई आजको तारिख तोकी पाएकोमा तपसिलमा उल्लिखित साक्षी {{unavailabilityReason}} भएको हुनाले मुलुकी फौजदारी कार्यविधि संहिता, २०७४ को दफा १०९(१) बमोजिम श्रव्य दृश्यमार्फत साक्षी बुझी पाउँन प्रस्तुत निवेदन दिएको छु/छौं। अड्डाको तर्फबाट/आफ्नै तर्फबाट/कानुन व्यवसायीमार्फत बकपत्र गराइपाऊँ ।\n\nसाक्षी विवरण: {{witnessDetails}}\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ४१ — धर्मपुत्र/धर्मपुत्री राख्न पाउँ/अनुमति पाऊँ (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "मुलुकी देवानी संहिता परिच्छेद ८ बमोजिम धर्मपुत्र/धर्मपुत्री राख्न अनुमति माग्ने निवेदन।",
    fields: [
      { key: "petitionerName", label: "निवेदकको नाम, थर", type: "text", autoFillSource: "client.fullName", required: true },
      { key: "petitionerAge", label: "निवेदकको उमेर", type: "text", required: true },
      { key: "petitionerAddress", label: "निवेदकको ठेगाना", type: "text", autoFillSource: "client.address", required: true },
      { key: "childName", label: "धर्मपुत्र/धर्मपुत्री हुने व्यक्तिको नाम, थर", type: "text", required: true },
      { key: "childAge", label: "निजको उमेर", type: "text" },
      { key: "childAddress", label: "निजको ठेगाना", type: "text" },
      { key: "relationToChild", label: "धर्मपुत्र/धर्मपुत्री राख्ने व्यक्तिसँगको नाता", type: "text" },
      { key: "adoptionReason", label: "धर्मपुत्र/धर्मपुत्री राख्नुपर्ने कारण", type: "textarea", required: true },
      { key: "financialStatus", label: "निवेदकको आर्थिक हैसियत", type: "text" },
      { key: "submissionDate", label: "मिति", type: "date", autoFillSource: "today" },
    ],
    bodyTemplate:
      "अनुसूची-४० (मुलुकी देवानी कार्यविधि नियमावली, २०७५ नियम ६६ को उपनियम (१) सँग सम्बन्धित)\n\nश्री {{courtName}} जिल्ला अदालतमा पेस गरेको\n\nनिवेदन पत्र\n\nविषयः धर्मपुत्र/धर्मपुत्री राख्न पाउँ/अनुमति पाऊँ ।\n\n" +
      "{{petitionerName}} — निवेदक, उमेर {{petitionerAge}}, ठेगाना {{petitionerAddress}}\n\n" +
      "मुलुकी देवानी संहिता, २०७४ को परिच्छेद ८ बमोजिम देहायको व्यक्तिलाई धर्मपुत्र/धर्मपुत्री राख्न इच्छा भएकोले निम्न विवरणसहित निवेदन गर्दछु। धर्मपुत्र/धर्मपुत्रीको लिखत दुई प्रति र लाग्ने दस्तुर रु.५००।- यसै साथ संलग्न छ ।\n\n" +
      "(२) धर्मपुत्र/धर्मपुत्री हुने व्यक्तिः नाम {{childName}}, उमेर {{childAge}}, ठेगाना {{childAddress}}, नाता: {{relationToChild}}\n\n" +
      "(३) धर्मपुत्र राख्नुपर्ने कारणः {{adoptionReason}}\n\n(४) निवेदकको आर्थिक हैसियतः {{financialStatus}}\n\n" +
      "यस निवेदनपत्रको बेहोरा ठिक साँचो छ, झुट्टा बेहोरा लेखिएको ठहरे कानूनबमोजिम सजाय सहुँला बुझाउँला।\n\nनिवेदकको दस्तखत\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. २० — संशोधन गरिपाऊँ (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "फिरादपत्र/प्रतिउत्तरपत्र/निवेदनपत्रमा टाइप/लेखाइको त्रुटि सच्याउन लिखत संशोधन गरिपाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_DC_FIELDS,
      { key: "errorContent", label: "लिखतमा भएको त्रुटिको बेहोरा", type: "text" },
      { key: "errorPageNo", label: "पाना नं.", type: "text" },
      { key: "errorLineNo", label: "हरफ", type: "text" },
      { key: "correctedContent", label: "संशोधन हुनुपर्ने बेहोरा", type: "textarea", required: true },
    ],
    bodyTemplate:
      "श्री {{courtName}} जिल्ला अदालतमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : संशोधन गरिपाऊँ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौँ :\n\n" +
      "1. उल्लिखित मुद्दामा मैले/हामीले पेस गरेका फिरादपत्र/प्रतिउत्तरपत्र/निवेदनपत्रमा तपसिलमा उल्लेख भएअनुसारको टाइप/लेखाइको भुलबाट त्रुटि हुन गएको हुँदा सोको सट्टा तपसिलमा उल्लेख भएबमोजिमको बेहोरा कायम हुने गरी मुलुकी देवानी कार्यविधि नियमावली, २०७५ को नियम १४ बमोजिम लिखत संशोधन गरिपाऊँ।\n\n" +
      "त्रुटिको बेहोरा: {{errorContent}} | पाना नं.: {{errorPageNo}} | हरफ: {{errorLineNo}}\nसंशोधन हुनुपर्ने बेहोरा: {{correctedContent}}\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ३९ — संरक्षक नियुक्त गरिपाऊँ (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "असक्षम/अर्धसक्षम व्यक्तिको संरक्षक नियुक्ति गरिपाऊँ भन्ने निवेदन।",
    fields: [
      { key: "petitionerName", label: "निवेदकको नाम, थर", type: "text", autoFillSource: "client.fullName", required: true },
      { key: "petitionerAge", label: "निवेदकको उमेर", type: "text", required: true },
      { key: "petitionerAddress", label: "निवेदकको ठेगाना", type: "text", autoFillSource: "client.address", required: true },
      { key: "relationToIncapable", label: "असक्षम/अर्धसक्षम व्यक्तिसँगको नाता", type: "text" },
      { key: "proposedGuardianName", label: "संरक्षक नियुक्त गर्न प्रस्तावित व्यक्तिको नाम, थर", type: "text", required: true },
      { key: "proposedGuardianAddress", label: "प्रस्तावित संरक्षकको ठेगाना", type: "text" },
      { key: "incapablePersonName", label: "असक्षम/अर्धसक्षम व्यक्तिको नाम", type: "text", required: true },
      { key: "incapablePersonAge", label: "निजको उमेर", type: "text" },
      { key: "reasonAndDetails", label: "निवेदन दिनुपर्ने कारण र बेहोरा", type: "textarea", required: true },
      { key: "submissionDate", label: "मिति", type: "date", autoFillSource: "today" },
    ],
    bodyTemplate:
      "अनुसूची-३४ (मुलुकी देवानी कार्यविधि नियमावली, २०७५ नियम ६४ को उपनियम (१) सँग सम्बन्धित)\n\nश्री {{courtName}} जिल्ला अदालतमा पेस गरेको\n\nनिवेदन पत्र — संरक्षक नियुक्त गरिपाऊँ।\n\n" +
      "{{petitionerName}} — निवेदक, उमेर {{petitionerAge}}, ठेगाना {{petitionerAddress}}\n\n" +
      "मुलुकी देवानी संहिता, २०७४ को दफा १३९ बमोजिम देहायका असक्षम/अर्धसक्षम व्यक्तिको संरक्षक नियुक्ति गरिपाऊँ भनी निम्न विवरणसहित निवेदन गर्दछु। लाग्ने दस्तुर रु. ५००।- यसैसाथ संलग्न छ ।\n\n" +
      "निवेदकको नाता (असक्षम व्यक्तिसँग): {{relationToIncapable}}\n\n" +
      "(२) संरक्षक नियुक्त गर्न प्रस्तावित व्यक्तिः {{proposedGuardianName}}, ठेगाना {{proposedGuardianAddress}}\n\n" +
      "(३) असक्षम/अर्धसक्षम व्यक्तिः {{incapablePersonName}}, उमेर {{incapablePersonAge}}\n\n" +
      "(४) निवेदन दिनुपर्ने कारण र बेहोराः {{reasonAndDetails}}\n\n" +
      "यस निवेदनपत्रको बेहोरा ठिक साँचो छ, झुट्टा बेहोरा लेखिएको ठहरे कानूनबमोजिम सजाय सहुँला बुझाउँला।\n\nनिवेदकको दस्तखत\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. १४ — कारणी उपस्थित गराएको (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "तारिख तोकिएबमोजिम आफ्नो पक्ष/कारणी उपस्थित गराएको जनाउने निवेदन।",
    fields: [
      ...COMMON_DC_FIELDS,
      { key: "hearingDate", label: "उपस्थित गराउनु भनिएको मिति", type: "date" },
      { key: "presentedPersonName", label: "उपस्थित गराइएको पक्ष/कारणीको नाम", type: "text", required: true },
    ],
    bodyTemplate:
      "श्री {{courtName}} जिल्ला अदालतमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : कारणी उपस्थित गराएको ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु :–\n\n" +
      "१. उल्लिखित मुद्दामा मुलुकी देवानी कार्यविधि संहिता, २०७४ को दफा १७२(६) बमोजिम/छलफल निमित्त आज मिति {{hearingDate}} गते कारणीलाई उपस्थित गराउनु भनी तारिख तोकी पाएबमोजिम यसै निवेदनसाथ आफ्नो पक्ष/कारणी {{presentedPersonName}} लाई उपस्थित गराएको छु। आदेशबमोजिम गरिपाऊँ।\n\n२. लेखिएको बेहोरा ठिक साँचो हो झुट्टा ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. ७ — बयान गराइपाऊँ (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "म्याद/पक्राउ पुर्जी तामेल भएपछि हाजिर भई बयान गराइपाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_DC_FIELDS,
      { key: "summonServedDate", label: "म्याद/पक्राउ पुर्जी तामेल मिति", type: "date", required: true },
    ],
    bodyTemplate:
      "श्री {{courtName}} जिल्ला अदालतमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : बयान गराइपाऊँ ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु :–\n\n" +
      "१. उल्लिखित मुद्दामा यस अदालतबाट मेरा नाममा जारी भएको म्याद/पक्राउ पुर्जी मिति {{summonServedDate}} मा तामेल भएकाले म्यादभित्र/म्याद थामी/जारी भएको म्याद/पक्राउ पुर्जीबमोजिम हाजिर हुन आएको छु। मुलुकी देवानी कार्यविधि संहिता, २०७४ को दफा १७५/मुलुकी फौजदारी कार्यविधि संहिता, २०७४ को दफा ५२ र ऐ. दफा १२२ बमोजिम बयान गराई पाऊँ ।\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
  {
    title: "फाराम नं. १९ — साक्षी हाजिर गराई बकपत्र गराइपाऊँ (जिल्ला अदालत)",
    category: DISTRICT_COURT,
    description: "फिरादपत्र/प्रतिउत्तरपत्रमा उल्लिखित साक्षी लिई हाजिर भई बकपत्र गराइपाऊँ भन्ने निवेदन।",
    fields: [
      ...COMMON_DC_FIELDS,
      { key: "witnessList", label: "साक्षी(हरू) को नाम, जिल्ला, न.पा./गा.पा., वडा नं., उमेर", type: "textarea", required: true },
    ],
    bodyTemplate:
      "श्री {{courtName}} जिल्ला अदालतमा पेस गरेको\n\nनिवेदन पत्र\n\nविषय : साक्षी हाजिर गराई बकपत्र गराइपाऊँ ।\n\nमुद्दा नं. {{caseNo}}\n\n" +
      "{{petitionerFatherName}} को छोरा/... जिल्ला {{petitionerDistrict}} न.पा./गा.पा. वडा नं. {{petitionerWardNo}} बस्ने वर्ष {{petitionerAge}} को {{petitionerName}} — निवेदक\n\nविरुद्ध\n\n" +
      "{{respondentFatherName}} को छोरा/... जिल्ला {{respondentDistrict}} न.पा./गा.पा. वडा नं. {{respondentWardNo}} बस्ने वर्ष {{respondentAge}} को {{respondentName}} — विपक्षी\n\nमुद्दा– {{caseSubject}}\n\n" +
      "निवेदनबापत लाग्ने दस्तुर रु.१०।– साथै राखी निम्नानुसार निवेदन गर्दछु/गर्दछौं :–\n\n" +
      "१. मुलुकी देवानी कार्यविधि संहिता, २०७४ को दफा १७९, १८३, १८६ बमोजिम/मुलुकी फौजदारी कार्यविधि संहिता, २०७४ को दफा १०१, १०६ बमोजिम उल्लिखित मुद्दामा सम्मानित अदालतको आदेशबमोजिम फिरादपत्र र प्रतिउत्तरपत्र/बयानको प्रमाण खण्डमा उल्लिखित साक्षी लिई हाजिर हुन आउनु भनी मलाई/हामीलाई आजको तारिख तोकी पाएकोमा तपसिलमा उल्लिखित साक्षी लिई उपस्थित भएको छु/छौं। हाजिर गराई अड्डाको तर्फबाट/आफ्नै तर्फबाट/कानून व्यवसायीमार्फत बकपत्र गराइपाऊँ ।\n\nसाक्षी विवरण: {{witnessList}}\n\n२. लेखिएको बेहोरा ठिक साँचो हो फरक ठहरे कानूनबमोजिम सहुँला बुझाउँला ।\n\nनिवेदक\n\nमिति: {{submissionDate}}",
  },
];

async function main() {
  console.log("Seeding Batch 5 — District Court templates (11 more)...");

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

  console.log(`Batch 5 complete. ${created} new template(s) created. जिल्ला अदालत folder: 26/70+ done — more remain.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
