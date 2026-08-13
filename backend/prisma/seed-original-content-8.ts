import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding batch 8 — large multi-subject push...");

  const admin = await prisma.user.findFirst({ where: { accountType: "COMPANY" } });
  if (!admin) { console.error("No COMPANY user found."); process.exit(1); }

  const lawCourse = await prisma.course.findFirst({ where: { name: "Law Exam Preparation" } });
  const ieltsCourse = await prisma.course.findFirst({ where: { name: "IELTS Preparation" } });
  if (!lawCourse || !ieltsCourse) { console.error("Run seed-phase2-demo.ts first."); process.exit(1); }

  const subjects: Record<string, any> = {};
  for (const name of ["Constitutional Law", "Criminal Law", "Contract Law", "Civil Procedure", "Family Law", "Property Law"]) {
    subjects[name] = await prisma.subject.findFirst({ where: { name, courseId: lawCourse.id } });
  }
  for (const name of ["Reading", "Listening", "Writing", "Grammar"]) {
    subjects[name] = await prisma.subject.findFirst({ where: { name, courseId: ieltsCourse.id } });
  }

  let total = 0;
  async function add(subjectName: string, courseId: string, examType: string | null, qs: any[]) {
    const subject = subjects[subjectName];
    if (!subject) { console.log(`Skipping ${subjectName} — subject not found`); return; }
    let created = 0;
    for (const q of qs) {
      const existing = await prisma.mcqQuestion.findFirst({ where: { question: q.question } });
      if (!existing) {
        await prisma.mcqQuestion.create({ data: { ...q, examType, subjectId: subject.id, courseId, createdBy: admin!.id } as any });
        created++;
      }
    }
    total += created;
    console.log(`${subjectName}: ${created} added`);
  }

  await add("Constitutional Law", lawCourse.id, "LLB", [
    { question: "नेपालको संविधान अनुसार राज्यको मौलिक संरचना के हो?", optionA: "एकात्मक", optionB: "संघीय, लोकतान्त्रिक, गणतन्त्रात्मक", optionC: "राजतन्त्रात्मक", optionD: "साम्यवादी", correctOption: "B", explanation: "नेपाल संघीय लोकतान्त्रिक गणतन्त्रात्मक राज्य हो।", difficulty: "EASY", isFreeDemo: true },
    { question: "संविधानको प्रस्तावनामा उल्लेखित मूल्यमान्यता होइन कुन?", optionA: "समाजवाद उन्मुख", optionB: "समावेशी", optionC: "राजतन्त्र पुनर्स्थापना", optionD: "धर्मनिरपेक्ष", correctOption: "C", explanation: "संविधानको प्रस्तावनाले धर्मनिरपेक्ष, समाजवाद उन्मुख, समावेशी राज्यको परिकल्पना गरेको छ, राजतन्त्र पुनर्स्थापना होइन।", difficulty: "MEDIUM", isFreeDemo: false },
    { question: "मौलिक हक कार्यान्वयनको लागि कुन अदालतमा रिट दायर गर्न सकिन्छ?", optionA: "सर्वोच्च अदालत", optionB: "स्थानीय अदालत", optionC: "प्रशासनिक अदालत", optionD: "वडा कार्यालय", correctOption: "A", explanation: "मौलिक हक हनन भएमा सर्वोच्च अदालतमा सोझै रिट निवेदन दिन सकिन्छ।", difficulty: "MEDIUM", isFreeDemo: false },
    { question: "संघीय संसदको तल्लो सदनलाई के भनिन्छ?", optionA: "राष्ट्रिय सभा", optionB: "प्रतिनिधि सभा", optionC: "प्रादेशिक सभा", optionD: "गाउँ सभा", correctOption: "B", explanation: "प्रतिनिधि सभा तल्लो सदन हो, राष्ट्रिय सभा माथिल्लो सदन हो।", difficulty: "EASY", isFreeDemo: false },
    { question: "प्रतिनिधि सभाको सदस्य संख्या कति छ?", optionA: "५९", optionB: "१६५", optionC: "२७५", optionD: "३३०", correctOption: "C", explanation: "प्रतिनिधि सभामा जम्मा २७५ सदस्य रहन्छन् (प्रत्यक्ष १६५ + समानुपातिक ११०)।", difficulty: "MEDIUM", isFreeDemo: false },
    { question: "राष्ट्रिय सभाको सदस्य संख्या कति छ?", optionA: "५९", optionB: "७५", optionC: "१००", optionD: "१२५", correctOption: "A", explanation: "राष्ट्रिय सभामा जम्मा ५९ सदस्य रहन्छन्।", difficulty: "MEDIUM", isFreeDemo: false },
    { question: "संवैधानिक इजलासको गठन कसले गर्छ?", optionA: "राष्ट्रपति", optionB: "प्रधानन्यायाधीश", optionC: "प्रधानमन्त्री", optionD: "सभामुख", correctOption: "B", explanation: "संवैधानिक इजलासको गठन प्रधानन्यायाधीशले गर्छन्।", difficulty: "HARD", isFreeDemo: false },
    { question: "नेपालमा कति वटा स्थानीय तह छन्?", optionA: "६ प्रदेश", optionB: "७५३ स्थानीय तह", optionC: "७७ जिल्ला", optionD: "१४ अञ्चल", correctOption: "B", explanation: "नेपालमा जम्मा ७५३ वटा स्थानीय तह (गाउँपालिका/नगरपालिका) रहेका छन्।", difficulty: "MEDIUM", isFreeDemo: false },
    { question: "नेपालमा जिल्लाको संख्या कति छ?", optionA: "७५", optionB: "७७", optionC: "८०", optionD: "७३", correctOption: "B", explanation: "नेपालमा जम्मा ७७ जिल्ला छन्।", difficulty: "EASY", isFreeDemo: false },
    { question: "संविधान अनुसार न्यायपालिकाको सर्वोच्च अंग कुन हो?", optionA: "उच्च अदालत", optionB: "जिल्ला अदालत", optionC: "सर्वोच्च अदालत", optionD: "विशेष अदालत", correctOption: "C", explanation: "सर्वोच्च अदालत नेपालको न्यायपालिकाको सर्वोच्च तथा अन्तिम अंग हो।", difficulty: "EASY", isFreeDemo: false },
  ]);

  await add("Criminal Law", lawCourse.id, "LLB", [
    { question: "मुलुकी अपराध संहिता कुन कानूनलाई प्रतिस्थापन गर्न ल्याइएको हो?", optionA: "मुलुकी ऐन", optionB: "देवानी संहिता", optionC: "श्रम ऐन", optionD: "कम्पनी ऐन", correctOption: "A", explanation: "मुलुकी अपराध संहिताले पुरानो मुलुकी ऐनको फौजदारी व्यवस्थालाई प्रतिस्थापन गरेको हो।", difficulty: "MEDIUM", isFreeDemo: true },
    { question: "कुनै अपराध गर्न उद्योग (Attempt) गरेमा के हुन्छ?", optionA: "कुनै सजाय हुँदैन", optionB: "पूर्ण अपराध सरहको सजाय", optionC: "कानूनमा तोकिए बमोजिम आंशिक सजाय हुन सक्छ", optionD: "matra जरिवाना हुन्छ", correctOption: "C", explanation: "अपराध गर्न उद्योग गरेमा पनि कानूनमा तोकिए बमोजिम सजायको व्यवस्था हुन्छ।", difficulty: "MEDIUM", isFreeDemo: false },
    { question: "सहअपराधी (Accomplice) भनेको के हो?", optionA: "अपराध रोक्ने व्यक्ति", optionB: "अपराध गर्न मतियार हुने व्यक्ति", optionC: "पीडित व्यक्ति", optionD: "गवाही दिने व्यक्ति", correctOption: "B", explanation: "मुख्य अपराधीलाई अपराध गर्न सघाउ पुर्‍याउने वा मतियार हुने व्यक्तिलाई सहअपराधी भनिन्छ।", difficulty: "MEDIUM", isFreeDemo: false },
    { question: "जमानतमा छाड्ने अधिकार सामान्यतया कसलाई हुन्छ?", optionA: "प्रहरी प्रमुख", optionB: "अदालत", optionC: "वडाध्यक्ष", optionD: "मन्त्री", correctOption: "B", explanation: "अभियुक्तलाई जमानतमा छाड्ने वा नछाड्ने निर्णय अदालतले गर्छ।", difficulty: "EASY", isFreeDemo: false },
    { question: "बालबालिकालाई कुटपिट गर्नु कस्तो अपराध मानिन्छ?", optionA: "साधारण कसुर", optionB: "गम्भीर कसुर, कानूनी कारबाहीको भागी", optionC: "कुनै कसुर होइन", optionD: "matra सामाजिक विषय हो", correctOption: "B", explanation: "बालबालिकामाथिको हिंसा/कुटपिट कानून अनुसार गम्भीर कसुर मानिन्छ र कारबाही हुन्छ।", difficulty: "EASY", isFreeDemo: false },
    { question: "'Mens Rea' को अर्थ के हो?", optionA: "अपराधिक कार्य", optionB: "अपराधिक मनसाय/नियत", optionC: "सजाय", optionD: "प्रमाण", correctOption: "B", explanation: "Mens Rea फौजदारी कानूनको एक सिद्धान्त हो जसको अर्थ अपराध गर्ने मनसाय/नियत हो।", difficulty: "HARD", isFreeDemo: false },
    { question: "'Actus Reus' को अर्थ के हो?", optionA: "अपराधिक कार्य/क्रियाकलाप", optionB: "मनसाय", optionC: "सजाय", optionD: "क्षमादान", correctOption: "A", explanation: "Actus Reus भनेको अपराध गठन गर्ने वास्तविक कार्य/क्रियाकलाप हो।", difficulty: "HARD", isFreeDemo: false },
  ]);

  await add("Contract Law", lawCourse.id, "LLB", [
    { question: "करार प्रस्ताव (Offer) र स्वीकृति (Acceptance) मिलेपछि के बन्छ?", optionA: "वाचा", optionB: "करार", optionC: "इच्छापत्र", optionD: "धितो", correctOption: "B", explanation: "प्रस्ताव र स्वीकृति मिलेपछि करार (Agreement) बन्छ, जुन वैध तत्व पुगेमा बाध्यकारी हुन्छ।", difficulty: "EASY", isFreeDemo: true },
    { question: "गलत प्रस्तुतिकरण (Misrepresentation) को आधारमा करार कस्तो हुन्छ?", optionA: "स्वतः वैध", optionB: "वदर गर्न मिल्ने (Voidable)", optionC: "स्वतः अवैध", optionD: "कुनै असर पर्दैन", correctOption: "B", explanation: "गलत प्रस्तुतिकरणको आधारमा भएको करार पीडित पक्षको इच्छामा वदर गर्न मिल्ने हुन्छ।", difficulty: "MEDIUM", isFreeDemo: false },
    { question: "करारको उद्देश्य गैरकानूनी भएमा त्यो करार कस्तो हुन्छ?", optionA: "वैध", optionB: "शून्य (Void)", optionC: "आंशिक वैध", optionD: "पछि सच्याउन मिल्ने", correctOption: "B", explanation: "गैरकानूनी उद्देश्यको लागि गरिएको करार सुरुदेखि नै शून्य मानिन्छ।", difficulty: "MEDIUM", isFreeDemo: false },
    { question: "'Consideration' शब्दको सही अर्थ के हो?", optionA: "करारको प्रतिफल/बदला", optionB: "करार गर्ने ठाउँ", optionC: "करार गर्ने मिति", optionD: "साक्षी", correctOption: "A", explanation: "Consideration भनेको करारमा एक पक्षले अर्को पक्षबाट पाउने प्रतिफल वा बदला हो।", difficulty: "MEDIUM", isFreeDemo: false },
  ]);

  await add("Civil Procedure", lawCourse.id, "LLB", [
    { question: "फिरादपत्र दायर गर्दा तिर्नुपर्ने रकमलाई के भनिन्छ?", optionA: "जरिवाना", optionB: "अदालती दस्तुर (कोर्ट फि)", optionC: "जमानत रकम", optionD: "क्षतिपूर्ति", correctOption: "B", explanation: "फिरादपत्र दायर गर्दा दाबी बमोजिम अदालती दस्तुर (कोर्ट फि) तिर्नुपर्छ।", difficulty: "EASY", isFreeDemo: true },
    { question: "प्रमाण बुझ्ने क्रममा अदालतले गवाहीलाई के भनिन्छ?", optionA: "बयान", optionB: "जाहेरी", optionC: "उजुरी", optionD: "निवेदन", correctOption: "A", explanation: "अदालतमा गवाही/कथन दिने प्रक्रियालाई बयान भनिन्छ।", difficulty: "MEDIUM", isFreeDemo: false },
    { question: "फैसला कार्यान्वयन नभएमा के गर्न सकिन्छ?", optionA: "फेरि फिराद दिने", optionB: "कार्यान्वयन (Execution) को निवेदन दिने", optionC: "केही गर्न मिल्दैन", optionD: "अदालत परिवर्तन गर्ने", correctOption: "B", explanation: "फैसला कार्यान्वयन नभएमा जितेको पक्षले कार्यान्वयन (Execution) को निवेदन दिन सक्छ।", difficulty: "MEDIUM", isFreeDemo: false },
  ]);

  await add("Family Law", lawCourse.id, "LLB", [
    { question: "बालबालिकाको संरक्षकत्व (Custody) निर्णय गर्दा अदालतले मुख्यतया के हेर्छ?", optionA: "बाबुको आर्थिक अवस्था matra", optionB: "बालबालिकाको सर्वोत्तम हित", optionC: "आमाको इच्छा matra", optionD: "जो पहिले निवेदन दिन्छ", correctOption: "B", explanation: "संरक्षकत्वको निर्णयमा अदालतले सधैं बालबालिकाको सर्वोत्तम हितलाई प्राथमिकता दिन्छ।", difficulty: "MEDIUM", isFreeDemo: true },
    { question: "गुजारा भत्ता (Alimony) पाउने हक कसलाई हुन्छ?", optionA: "matra छोराछोरीलाई", optionB: "आर्थिक रूपमा निर्भर पति/पत्नीलाई", optionC: "matra बाबुआमालाई", optionD: "कसैलाई हुँदैन", correctOption: "B", explanation: "सम्बन्ध विच्छेद पछि आर्थिक रूपमा निर्भर पक्षले गुजारा भत्ता पाउन सक्छ।", difficulty: "MEDIUM", isFreeDemo: false },
  ]);

  await add("Property Law", lawCourse.id, "LLB", [
    { question: "धितो (Mortgage) राखेको सम्पत्ति ऋण नतिरे के हुन्छ?", optionA: "स्वतः सरकारको हुन्छ", optionB: "ऋणदाताले कानूनी प्रक्रिया अपनाई लिलाम गर्न सक्छ", optionC: "कुनै कारबाही हुँदैन", optionD: "ऋणी स्वतः दण्डित हुन्छ", correctOption: "B", explanation: "धितो राखेको सम्पत्ति ऋण नतिरेमा ऋणदाताले कानूनी प्रक्रिया पुर्‍याई लिलाम बिक्री गर्न सक्छ।", difficulty: "MEDIUM", isFreeDemo: true },
    { question: "भाडामा (Lease) दिएको घरको स्वामित्व कोसँग रहन्छ?", optionA: "भाडामा बस्नेसँग", optionB: "घरधनीसँग नै रहन्छ", optionC: "सरकारसँग", optionD: "कसैसँग रहँदैन", correctOption: "B", explanation: "Lease/भाडामा दिँदा matra प्रयोगको अधिकार हस्तान्तरण हुन्छ, स्वामित्व घरधनीसँग नै रहन्छ।", difficulty: "EASY", isFreeDemo: false },
  ]);

  await add("Grammar", ieltsCourse.id, null, [
    { question: "Choose the correct sentence:", optionA: "If I was you, I would apologize.", optionB: "If I were you, I would apologize.", optionC: "If I am you, I would apologize.", optionD: "If I would be you, I apologize.", correctOption: "B", explanation: 'Second conditional uses "were" for all subjects in the if-clause, not "was".', difficulty: "MEDIUM", isFreeDemo: true },
    { question: "Which sentence correctly uses a relative clause?", optionA: "The man who he called me is my uncle.", optionB: "The man who called me is my uncle.", optionC: "The man which called me is my uncle.", optionD: "The man whom called me is my uncle.", correctOption: "B", explanation: '"Who" is used for people as the subject of the clause; no extra pronoun is needed.', difficulty: "MEDIUM", isFreeDemo: false },
    { question: "Choose the sentence with the correct modal verb usage:", optionA: "You must to finish this today.", optionB: "You must finish this today.", optionC: "You must finishing this today.", optionD: "You must finished this today.", correctOption: "B", explanation: 'Modal verbs like "must" are followed directly by the base form of the verb, with no "to".', difficulty: "EASY", isFreeDemo: false },
    { question: "Which sentence uses reported speech correctly?", optionA: "She said that she is tired.", optionB: "She said that she was tired.", optionC: "She said that she tired.", optionD: "She said she is being tired.", correctOption: "B", explanation: 'In reported speech, present tense usually shifts back to past tense: "is" becomes "was".', difficulty: "MEDIUM", isFreeDemo: false },
    { question: "Choose the correctly formed question:", optionA: "Where you are going?", optionB: "Where are you going?", optionC: "Where going are you?", optionD: "You are going where?", correctOption: "B", explanation: 'Standard question word order: Where + auxiliary verb + subject + main verb.', difficulty: "EASY", isFreeDemo: false },
  ]);

  console.log(`\nBatch 8 done. ${total} new questions added.`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
