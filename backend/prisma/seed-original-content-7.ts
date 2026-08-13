import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// All content below is ORIGINAL — written for this platform, not copied
// from any copyrighted source. Law questions are based on publicly
// available facts about Nepal's legal system.

async function main() {
  console.log("Seeding batch 7 — new subjects + more content...");

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

  const ieltsReading = await prisma.subject.findFirst({ where: { name: "Reading", courseId: ieltsCourse.id } });
  const ieltsListening = await prisma.subject.findFirst({ where: { name: "Listening", courseId: ieltsCourse.id } });
  const ieltsGrammar = await prisma.subject.findFirst({ where: { name: "Grammar", courseId: ieltsCourse.id } });

  let familyLaw = await prisma.subject.findFirst({ where: { name: "Family Law", courseId: lawCourse.id } });
  if (!familyLaw) {
    familyLaw = await prisma.subject.create({ data: { name: "Family Law", courseId: lawCourse.id, examType: "LLB" } });
  }

  let propertyLaw = await prisma.subject.findFirst({ where: { name: "Property Law", courseId: lawCourse.id } });
  if (!propertyLaw) {
    propertyLaw = await prisma.subject.create({ data: { name: "Property Law", courseId: lawCourse.id, examType: "LLB" } });
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

  const familyLawQuestions = [
    {
      question: "नेपालमा विवाह गर्न न्यूनतम उमेर हद कति तोकिएको छ?",
      optionA: "१६ वर्ष",
      optionB: "१८ वर्ष",
      optionC: "२० वर्ष",
      optionD: "२१ वर्ष",
      correctOption: "C",
      explanation: "मुलुकी देवानी संहिता अनुसार विवाह गर्न महिला र पुरुष दुबैको न्यूनतम उमेर २० वर्ष पुगेको हुनुपर्छ।",
      difficulty: "EASY",
      isFreeDemo: true,
    },
    {
      question: "सम्पत्तिमा छोरा-छोरीको हक सम्बन्धमा हालको कानूनी व्यवस्था के हो?",
      optionA: "matra छोरालाई हक हुन्छ",
      optionB: "छोरा र छोरी दुबैलाई समान हक हुन्छ",
      optionC: "बिबाह नभएसम्म matra छोरीलाई हक हुन्छ",
      optionD: "सम्पत्तिमा कसैलाई हक हुँदैन",
      correctOption: "B",
      explanation: "हालको कानून अनुसार अंशबण्डामा छोरा र छोरी दुबैलाई समान हक प्रदान गरिएको छ।",
      difficulty: "MEDIUM",
      isFreeDemo: false,
    },
    {
      question: "सम्बन्ध विच्छेद (Divorce) को लागि कहाँ निवेदन दिनुपर्छ?",
      optionA: "सम्बन्धित जिल्ला अदालत",
      optionB: "सर्वोच्च अदालत",
      optionC: "वडा कार्यालय",
      optionD: "प्रहरी कार्यालय",
      correctOption: "A",
      explanation: "सम्बन्ध विच्छेदको मुद्दा सम्बन्धित जिल्ला अदालतमा दायर गरिन्छ।",
      difficulty: "EASY",
      isFreeDemo: false,
    },
  ];
  console.log(`${await addQuestions(familyLaw.id, lawCourse.id, "LLB", familyLawQuestions)} Family Law MCQ(s) added`);

  const propertyLawQuestions = [
    {
      question: "जग्गा रजिस्ट्रेसन गर्ने कार्यालयलाई के भनिन्छ?",
      optionA: "मालपोत कार्यालय",
      optionB: "नापी कार्यालय",
      optionC: "जिल्ला प्रशासन कार्यालय",
      optionD: "यातायात व्यवस्था कार्यालय",
      correctOption: "A",
      explanation: "जग्गा रजिस्ट्रेसन (राजिनामा पास) गर्ने काम मालपोत कार्यालयबाट हुन्छ।",
      difficulty: "EASY",
      isFreeDemo: true,
    },
    {
      question: "कसैको जग्गामा लामो समयदेखि कब्जा जमाएर बसेको व्यक्तिले हक दाबी गर्न सक्ने सिद्धान्तलाई के भनिन्छ?",
      optionA: "Adverse Possession (प्रतिकूल कब्जा)",
      optionB: "Easement",
      optionC: "Mortgage",
      optionD: "Lease",
      correctOption: "A",
      explanation: "निश्चित शर्त पूरा भएमा लामो समयको निरन्तर कब्जाको आधारमा हक दाबी गर्न सकिने सिद्धान्तलाई Adverse Possession भनिन्छ।",
      difficulty: "HARD",
      isFreeDemo: false,
    },
  ];
  console.log(`${await addQuestions(propertyLaw.id, lawCourse.id, "LLB", propertyLawQuestions)} Property Law MCQ(s) added`);

  if (ieltsGrammar) {
    const moreGrammar2 = [
      {
        question: "Which sentence uses the passive voice correctly?",
        optionA: "The report was written by the team.",
        optionB: "The team was write the report.",
        optionC: "The report writing by the team.",
        optionD: "The team has wrote the report by.",
        correctOption: "A",
        explanation: 'Passive voice: "was/were + past participle" — "was written" is correct.',
        difficulty: "MEDIUM",
        isFreeDemo: true,
      },
      {
        question: "Choose the correct comparative form: 'This exam is ___ than the last one.'",
        optionA: "more difficult",
        optionB: "more difficulter",
        optionC: "difficulter",
        optionD: "most difficult",
        correctOption: "A",
        explanation: 'For longer adjectives, use "more + adjective" for the comparative, not "-er".',
        difficulty: "EASY",
        isFreeDemo: false,
      },
    ];
    console.log(`${await addQuestions(ieltsGrammar.id, ieltsCourse.id, null, moreGrammar2)} more IELTS Grammar MCQ(s) added`);
  }

  if (ieltsReading) {
    const passage5 =
      "Urban beekeeping has grown in popularity in cities around the world over the past fifteen years, driven partly by concern over declining bee populations and partly by interest in locally produced honey. City-kept bees often have access to a more diverse range of flowering plants than bees in agricultural areas, where large fields of a single crop dominate the landscape. However, urban beekeeping is not without controversy: as hobbyist beekeeping has grown, some researchers worry that a high density of honeybee hives in a small area could increase competition for limited flowers, potentially disadvantaging wild native bee species rather than helping pollinators as a whole.";

    const readingQuestions5 = [
      {
        question: `Reading Passage: "${passage5}"\n\nAccording to the passage, what advantage might city-kept bees have over bees in agricultural areas?`,
        optionA: "Access to a more diverse range of flowering plants",
        optionB: "Lower risk of disease",
        optionC: "Warmer temperatures year-round",
        optionD: "Less competition from other insects",
        correctOption: "A",
        explanation: "The passage states city-kept bees often have access to a more diverse range of flowering plants than bees in agricultural areas.",
        difficulty: "MEDIUM",
        isFreeDemo: false,
      },
      {
        question: `Reading Passage: "${passage5}"\n\nWhat concern do some researchers raise about urban beekeeping?`,
        optionA: "It produces low-quality honey",
        optionB: "It could disadvantage wild native bee species through competition for flowers",
        optionC: "It is illegal in most cities",
        optionD: "It requires too much government funding",
        correctOption: "B",
        explanation: "The passage states a high density of hives could increase competition for flowers, disadvantaging wild native bees.",
        difficulty: "MEDIUM",
        isFreeDemo: false,
      },
    ];
    console.log(`${await addQuestions(ieltsReading.id, ieltsCourse.id, null, readingQuestions5)} more IELTS Reading MCQ(s) added`);
  }

  if (ieltsListening) {
    const scenario3 =
      'Audio Transcript (simulated): "Good morning, and welcome to the museum. Please note that photography is allowed in most galleries, but flash photography is strictly prohibited to protect the artwork. The cafe closes at 4 PM, thirty minutes before the museum itself closes at 4:30 PM. Guided tours depart every hour from the main entrance."';

    const listeningQuestions3 = [
      {
        question: `${scenario3}\n\nWhat is strictly prohibited in the galleries?`,
        optionA: "All photography",
        optionB: "Flash photography",
        optionC: "Talking loudly",
        optionD: "Bringing bags",
        correctOption: "B",
        explanation: "The announcement states flash photography is strictly prohibited, while regular photography is allowed.",
        difficulty: "EASY",
        isFreeDemo: false,
      },
      {
        question: `${scenario3}\n\nWhat time does the museum close?`,
        optionA: "4:00 PM",
        optionB: "4:30 PM",
        optionC: "5:00 PM",
        optionD: "5:30 PM",
        correctOption: "B",
        explanation: "The announcement states the museum closes at 4:30 PM, thirty minutes after the cafe.",
        difficulty: "EASY",
        isFreeDemo: false,
      },
    ];
    console.log(`${await addQuestions(ieltsListening.id, ieltsCourse.id, null, listeningQuestions3)} more IELTS Listening MCQ(s) added`);
  }

  console.log(`\nBatch 7 done. ${createdTotal} new questions added.`);
  console.log("New subjects: Family Law, Property Law.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
