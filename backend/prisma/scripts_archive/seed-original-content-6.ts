import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// All content below is ORIGINAL — written for this platform, not copied
// from any copyrighted source. Law questions are based on publicly
// available facts about Nepal's legal system.

async function main() {
  console.log("Seeding batch 6 — broad content across all modules...");

  const admin = await prisma.user.findFirst({ where: { accountType: "COMPANY" } });
  if (!admin) {
    console.error("No COMPANY user found — run the main seed script first.");
    process.exit(1);
  }

  const lawCourse = await prisma.course.findFirst({ where: { name: "Law Exam Preparation" } });
  const ieltsCourse = await prisma.course.findFirst({ where: { name: "IELTS Preparation" } });
  if (!lawCourse || !ieltsCourse) {
    console.error("Run seed-phase2-demo.ts first.");
    process.exit(1);
  }

  const constLaw = await prisma.subject.findFirst({ where: { name: "Constitutional Law", courseId: lawCourse.id } });
  const criminalLaw = await prisma.subject.findFirst({ where: { name: "Criminal Law", courseId: lawCourse.id } });
  const ieltsReading = await prisma.subject.findFirst({ where: { name: "Reading", courseId: ieltsCourse.id } });
  const ieltsListening = await prisma.subject.findFirst({ where: { name: "Listening", courseId: ieltsCourse.id } });
  const ieltsGrammar = await prisma.subject.findFirst({ where: { name: "Grammar", courseId: ieltsCourse.id } });

  let contractLaw = await prisma.subject.findFirst({ where: { name: "Contract Law", courseId: lawCourse.id } });
  if (!contractLaw) {
    contractLaw = await prisma.subject.create({ data: { name: "Contract Law", courseId: lawCourse.id, examType: "LLB" } });
  }

  let civilProcedure = await prisma.subject.findFirst({ where: { name: "Civil Procedure", courseId: lawCourse.id } });
  if (!civilProcedure) {
    civilProcedure = await prisma.subject.create({ data: { name: "Civil Procedure", courseId: lawCourse.id, examType: "LLB" } });
  }

  let createdTotal = 0;
  async function addQuestions(subjectId: string, courseId: string, examType: string | null, questions: any[]) {
    let created = 0;
    for (const q of questions) {
      const existing = await prisma.mcqQuestion.findFirst({ where: { question: q.question } });
      if (!existing) {
        await prisma.mcqQuestion.create({
          data: { ...q, examType, subjectId, courseId, createdBy: admin!.id } as any,
        });
        created++;
      }
    }
    createdTotal += created;
    return created;
  }

  const contractQuestions = [
    {
      question: "कुनै सम्झौता (करार) वैध हुनको लागि आवश्यक आधारभूत तत्व कुन होइन?",
      optionA: "स्वतन्त्र सहमति",
      optionB: "वैध प्रतिफल (Consideration)",
      optionC: "पक्षहरूको करार गर्ने क्षमता",
      optionD: "मौखिक सम्झौता अनिवार्य हुनु",
      correctOption: "D",
      explanation: "सामान्यतया करार लिखित वा मौखिक दुबै हुन सक्छ — तर स्वतन्त्र सहमति, वैध प्रतिफल र क्षमता आवश्यक तत्व हुन्।",
      difficulty: "MEDIUM",
      isFreeDemo: true,
    },
    {
      question: "नाबालक (Minor) ले गरेको करार सामान्यतया कस्तो मानिन्छ?",
      optionA: "पूर्ण रूपमा बाध्यकारी",
      optionB: "शून्य (Void) — बाध्यकारी हुँदैन",
      optionC: "matra नाबालकको लागि बाध्यकारी",
      optionD: "अदालतको अनुमति चाहिन्छ जुनसुकै अवस्थामा",
      correctOption: "B",
      explanation: "नाबालकसँग करार गर्ने कानूनी क्षमता नभएकोले, निजले गरेको करार सामान्यतया शून्य मानिन्छ।",
      difficulty: "MEDIUM",
      isFreeDemo: false,
    },
    {
      question: "करार भंग (Breach of Contract) भएमा पीडित पक्षले सामान्यतया के दाबी गर्न सक्छ?",
      optionA: "क्षतिपूर्ति (Damages)",
      optionB: "जरिवाना matra",
      optionC: "कुनै दाबी गर्न पाइँदैन",
      optionD: "अर्को पक्षलाई कैद सजाय",
      correctOption: "A",
      explanation: "करार भंग भएमा पीडित पक्षले भएको हानि-नोक्सानीको क्षतिपूर्ति दाबी गर्न सक्छ।",
      difficulty: "EASY",
      isFreeDemo: false,
    },
  ];
  console.log(`${await addQuestions(contractLaw.id, lawCourse.id, "LLB", contractQuestions)} Contract Law MCQ(s) added`);

  const civilProcQuestions = [
    {
      question: "देवानी मुद्दामा वादीले पहिलो पटक अदालतमा दायर गर्ने कागजातलाई के भनिन्छ?",
      optionA: "फिरादपत्र",
      optionB: "प्रतिउत्तरपत्र",
      optionC: "पुनरावेदनपत्र",
      optionD: "निवेदनपत्र",
      correctOption: "A",
      explanation: "देवानी मुद्दा सुरु गर्न वादीले दायर गर्ने प्रारम्भिक कागजातलाई फिरादपत्र भनिन्छ।",
      difficulty: "EASY",
      isFreeDemo: true,
    },
    {
      question: "प्रतिवादीले फिरादको जवाफमा दायर गर्ने कागजातलाई के भनिन्छ?",
      optionA: "फिरादपत्र",
      optionB: "प्रतिउत्तरपत्र",
      optionC: "बयान",
      optionD: "इजलास पर्ची",
      correctOption: "B",
      explanation: "वादीको फिरादको जवाफमा प्रतिवादीले दायर गर्ने कागजातलाई प्रतिउत्तरपत्र भनिन्छ।",
      difficulty: "EASY",
      isFreeDemo: false,
    },
    {
      question: "जिल्ला अदालतको फैसलामा चित्त नबुझे कहाँ पुनरावेदन गर्न सकिन्छ?",
      optionA: "सर्वोच्च अदालत",
      optionB: "उच्च अदालत",
      optionC: "सम्बन्धित मन्त्रालय",
      optionD: "प्रधानमन्त्री कार्यालय",
      correctOption: "B",
      explanation: "जिल्ला अदालतको फैसला उपर सामान्यतया सम्बन्धित उच्च अदालतमा पुनरावेदन गरिन्छ।",
      difficulty: "MEDIUM",
      isFreeDemo: false,
    },
  ];
  console.log(`${await addQuestions(civilProcedure.id, lawCourse.id, "LLB", civilProcQuestions)} Civil Procedure MCQ(s) added`);

  if (constLaw) {
    const moreConst = [
      {
        question: "नेपालको संविधान कहिले जारी भएको हो?",
        optionA: "२०७२ साल असोज ३ गते",
        optionB: "२०६३ साल जेठ ११ गते",
        optionC: "२०४७ साल कार्तिक २३ गते",
        optionD: "२०७४ साल फागुन ७ गते",
        correctOption: "A",
        explanation: "नेपालको संविधान २०७२ साल असोज ३ गते जारी भएको हो।",
        difficulty: "EASY",
        isFreeDemo: true,
      },
      {
        question: "संघीय संसदमा कति सदन छन्?",
        optionA: "१ (एक सदनात्मक)",
        optionB: "२ (प्रतिनिधि सभा र राष्ट्रिय सभा)",
        optionC: "३",
        optionD: "सदन नै छैन",
        correctOption: "B",
        explanation: "नेपालको संघीय संसद प्रतिनिधि सभा र राष्ट्रिय सभा गरी दुई सदनात्मक व्यवस्था अन्तर्गत रहेको छ।",
        difficulty: "EASY",
        isFreeDemo: false,
      },
    ];
    console.log(`${await addQuestions(constLaw.id, lawCourse.id, "LLB", moreConst)} more Constitutional Law MCQ(s) added`);
  }

  if (criminalLaw) {
    const moreCriminal = [
      {
        question: "फौजदारी मुद्दामा कसुर प्रमाणित गर्ने जिम्मेवारी कसको हुन्छ?",
        optionA: "अभियुक्तको",
        optionB: "अभियोजन पक्ष (सरकारी वकिल)को",
        optionC: "अदालतको आफैं",
        optionD: "पीडितको मात्र",
        correctOption: "B",
        explanation: "फौजदारी न्यायमा 'निर्दोषिताको अनुमान' सिद्धान्त अनुसार, अभियुक्त दोषी हो भन्ने प्रमाणित गर्ने भार अभियोजन पक्षमा हुन्छ।",
        difficulty: "MEDIUM",
        isFreeDemo: false,
      },
    ];
    console.log(`${await addQuestions(criminalLaw.id, lawCourse.id, "LLB", moreCriminal)} more Criminal Law MCQ(s) added`);
  }

  if (ieltsGrammar) {
    const moreGrammar = [
      {
        question: "Choose the correctly punctuated sentence:",
        optionA: "Its a beautiful day, isnt it.",
        optionB: "It's a beautiful day, isn't it?",
        optionC: "Its' a beautiful day isnt it?",
        optionD: "It is a beautiful day isn't, it?",
        correctOption: "B",
        explanation: '"It\'s" (it is) needs an apostrophe, "isn\'t" needs an apostrophe, and a question needs a question mark.',
        difficulty: "EASY",
        isFreeDemo: true,
      },
      {
        question: "Which word correctly completes: 'She has lived here ___ 2015.'",
        optionA: "for",
        optionB: "since",
        optionC: "during",
        optionD: "while",
        correctOption: "B",
        explanation: '"Since" is used with a specific starting point in time (2015); "for" is used with a duration.',
        difficulty: "MEDIUM",
        isFreeDemo: false,
      },
    ];
    console.log(`${await addQuestions(ieltsGrammar.id, ieltsCourse.id, null, moreGrammar)} more IELTS Grammar MCQ(s) added`);
  }

  if (ieltsReading) {
    const passage4 =
      "Sleep researchers have increasingly focused on the relationship between screen use before bedtime and sleep quality. Blue light emitted by phones and laptops appears to suppress melatonin production, a hormone that signals to the body that it is time to sleep. However, some researchers caution against attributing poor sleep entirely to blue light, noting that the mentally stimulating content on screens may play an equal or greater role in delaying sleep onset than the light itself. This has led some experts to recommend not just dimming screens in the evening, but also shifting to less stimulating activities before bed regardless of the light source.";

    const readingQuestions4 = [
      {
        question: `Reading Passage: "${passage4}"\n\nWhat do some researchers say may be as important as blue light in delaying sleep?`,
        optionA: "Room temperature",
        optionB: "The mentally stimulating content on screens",
        optionC: "The brightness of the room",
        optionD: "The time of year",
        correctOption: "B",
        explanation: "The passage states stimulating content may play an equal or greater role than the light itself.",
        difficulty: "MEDIUM",
        isFreeDemo: false,
      },
      {
        question: `Reading Passage: "${passage4}"\n\nWhat do some experts recommend based on this?`,
        optionA: "Never using screens at all",
        optionB: "Only dimming screens, nothing else",
        optionC: "Shifting to less stimulating activities before bed, regardless of light source",
        optionD: "Sleeping with screens on",
        correctOption: "C",
        explanation: "The passage states experts recommend shifting to less stimulating activities before bed.",
        difficulty: "MEDIUM",
        isFreeDemo: false,
      },
    ];
    console.log(`${await addQuestions(ieltsReading.id, ieltsCourse.id, null, readingQuestions4)} more IELTS Reading MCQ(s) added`);
  }

  if (ieltsListening) {
    const scenario2 =
      'Audio Transcript (simulated): "Attention passengers, the 3:45 train to Pokhara has been delayed by twenty minutes due to signal maintenance. It will now depart from Platform 4 instead of Platform 2. We apologize for the inconvenience."';

    const listeningQuestions2 = [
      {
        question: `${scenario2}\n\nWhich platform will the train now depart from?`,
        optionA: "Platform 2",
        optionB: "Platform 3",
        optionC: "Platform 4",
        optionD: "Platform 5",
        correctOption: "C",
        explanation: "The announcement states the train will now depart from Platform 4 instead of Platform 2.",
        difficulty: "EASY",
        isFreeDemo: false,
      },
      {
        question: `${scenario2}\n\nWhy has the train been delayed?`,
        optionA: "Bad weather",
        optionB: "Signal maintenance",
        optionC: "A staff shortage",
        optionD: "A mechanical fault",
        correctOption: "B",
        explanation: "The announcement states the delay is due to signal maintenance.",
        difficulty: "EASY",
        isFreeDemo: false,
      },
    ];
    console.log(`${await addQuestions(ieltsListening.id, ieltsCourse.id, null, listeningQuestions2)} more IELTS Listening MCQ(s) added`);
  }

  console.log(`\nBatch 6 done. ${createdTotal} new questions added across all modules.`);
  console.log("New subjects: Contract Law, Civil Procedure.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
