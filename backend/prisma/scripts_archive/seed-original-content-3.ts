import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// All content below is ORIGINAL — written for this platform, not copied
// from any copyrighted source. Law questions are based on publicly
// available facts about Nepal's legal system.

async function main() {
  console.log("Seeding batch 3 of original content (new subjects)...");

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

  // --- New subjects ---
  let criminalLaw = await prisma.subject.findFirst({ where: { name: "Criminal Law", courseId: lawCourse.id } });
  if (!criminalLaw) {
    criminalLaw = await prisma.subject.create({ data: { name: "Criminal Law", courseId: lawCourse.id, examType: "LLB" } });
  }

  let ieltsGrammar = await prisma.subject.findFirst({ where: { name: "Grammar", courseId: ieltsCourse.id } });
  if (!ieltsGrammar) {
    ieltsGrammar = await prisma.subject.create({ data: { name: "Grammar", courseId: ieltsCourse.id } });
  }

  // --- Criminal Law MCQs (Nepal legal facts — public information) ---
  const criminalLawQuestions = [
    {
      question: "मुलुकी अपराध संहिता अनुसार कुनै अपराधको मुद्दा हेर्ने म्याद (हदम्याद) सामान्यतया कति समयभित्र दायर गर्नुपर्छ?",
      optionA: "अपराध कानूनमा तोकिएको हदम्याद भित्र",
      optionB: "जहिलेसुकै पनि म्याद लाग्दैन",
      optionC: "१ दिनभित्र मात्र",
      optionD: "१०० दिनभित्र मात्र",
      correctOption: "A",
      explanation: "फौजदारी मुद्दाको हदम्याद अपराधको प्रकृति अनुसार ऐनमा नै छुट्टाछुट्टै तोकिएको हुन्छ।",
      difficulty: "MEDIUM",
    },
    {
      question: "नेपाली कानून अनुसार कुन अवस्थामा आत्मरक्षाको हकको प्रयोग गर्न पाइन्छ?",
      optionA: "जुनसुकै बेला जो कसैलाई आक्रमण गर्न",
      optionB: "आफु वा अरुको ज्यान वा सम्पत्तिमा तत्काल खतरा परेको बेला उचित बल प्रयोग गर्न",
      optionC: "पुरानो झगडाको बदला लिन",
      optionD: "आत्मरक्षाको हक नेपाली कानूनमा छैन",
      correctOption: "B",
      explanation: "मुलुकी अपराध संहिता अनुसार तत्काल खतराबाट बचाउ गर्न उचित हदसम्मको बल प्रयोग आत्मरक्षा मानिन्छ।",
      difficulty: "MEDIUM",
    },
    {
      question: "१८ वर्ष मुनिको व्यक्तिले अपराध गरेमा निजलाई कुन कानून अन्तर्गत कारबाही गरिन्छ?",
      optionA: "साधारण फौजदारी कानून",
      optionB: "बाल न्याय सम्बन्धी कानून",
      optionC: "निजमाथि कुनै कारबाही हुँदैन",
      optionD: "सैनिक कानून",
      correctOption: "B",
      explanation: "बालबालिकाले गरेको कसुरमा बाल न्याय (सुधार तथा संरक्षण) ऐन अन्तर्गत विशेष प्रक्रिया अपनाइन्छ।",
      difficulty: "MEDIUM",
    },
    {
      question: "कुनै व्यक्तिलाई पक्राउ गरेको कति घण्टाभित्र अदालतमा पेश गर्नुपर्छ (संविधान बमोजिम)?",
      optionA: "१२ घण्टा",
      optionB: "२४ घण्टा",
      optionC: "४८ घण्टा",
      optionD: "७२ घण्टा",
      correctOption: "B",
      explanation: "संविधानको धारा २० बमोजिम पक्राउ परेको व्यक्तिलाई पक्राउ भएको २४ घण्टाभित्र अदालतमा पेश गर्नुपर्छ (बाटोको म्याद बाहेक)।",
      difficulty: "MEDIUM",
    },
    {
      question: "कुनै अपराधमा दोषी ठहर नहुन्जेल अभियुक्तलाई कस्तो मानिन्छ?",
      optionA: "दोषी",
      optionB: "निर्दोष (Presumption of innocence)",
      optionC: "आधा दोषी",
      optionD: "कानूनले कुनै अनुमान गर्दैन",
      correctOption: "B",
      explanation: "अदालतबाट कसुरदार ठहर नभएसम्म हरेक व्यक्ति निर्दोष रहन्छ भन्ने सिद्धान्त फौजदारी न्यायको आधारभूत सिद्धान्त हो।",
      difficulty: "EASY",
    },
    {
      question: "नेपालमा मृत्युदण्ड सजायको व्यवस्था छ कि छैन?",
      optionA: "छ, गम्भीर अपराधमा",
      optionB: "छैन, संविधानले नै निषेध गरेको छ",
      optionC: "छ, तर राष्ट्रपतिको स्वीकृति चाहिन्छ",
      optionD: "युद्ध अपराधमा मात्र छ",
      correctOption: "B",
      explanation: "नेपालको संविधानले मृत्युदण्डलाई पूर्ण रूपमा निषेध गरेको छ — कुनै पनि अपराधमा मृत्युदण्ड दिन पाइँदैन।",
      difficulty: "EASY",
    },
  ];

  let created = 0;
  for (const q of criminalLawQuestions) {
    const existing = await prisma.mcqQuestion.findFirst({ where: { question: q.question } });
    if (!existing) {
      await prisma.mcqQuestion.create({
        data: { ...q, examType: "LLB", isFreeDemo: created < 1, subjectId: criminalLaw.id, courseId: lawCourse.id, createdBy: admin.id } as any,
      });
      created++;
    }
  }
  console.log(`${created} Criminal Law MCQ(s) added`);

  // --- IELTS Grammar MCQs (original, general English grammar knowledge) ---
  const grammarQuestions = [
    {
      question: "Choose the correct sentence:",
      optionA: "She don't like coffee.",
      optionB: "She doesn't likes coffee.",
      optionC: "She doesn't like coffee.",
      optionD: "She not like coffee.",
      correctOption: "C",
      explanation: 'The correct negative form of the simple present with a third-person singular subject is "doesn\'t + base verb".',
      difficulty: "EASY",
    },
    {
      question: "Which sentence correctly uses the present perfect tense?",
      optionA: "I have seen that movie last week.",
      optionB: "I have seen that movie already.",
      optionC: "I have see that movie.",
      optionD: "I has seen that movie.",
      correctOption: "B",
      explanation: 'Present perfect ("have/has + past participle") is used with words like "already", not with specific past time expressions like "last week".',
      difficulty: "MEDIUM",
    },
    {
      question: "Identify the sentence with the correct use of articles:",
      optionA: "She is an university student.",
      optionB: "She is a university student.",
      optionC: "She is university student.",
      optionD: "She is the university student in general.",
      correctOption: "B",
      explanation: '"University" starts with a consonant sound, so it takes "a", not "an", despite starting with a vowel letter.',
      difficulty: "MEDIUM",
    },
    {
      question: "Choose the sentence with correct subject-verb agreement:",
      optionA: "The list of items are on the table.",
      optionB: "The list of items is on the table.",
      optionC: "The list of items were on the table.",
      optionD: "The list of items being on the table.",
      correctOption: "B",
      explanation: 'The subject is "list" (singular), not "items", so the verb must agree with "list" — "is".',
      difficulty: "MEDIUM",
    },
    {
      question: "Which sentence uses a conditional correctly?",
      optionA: "If I will have time, I will call you.",
      optionB: "If I have time, I will call you.",
      optionC: "If I had time, I will call you.",
      optionD: "If I have time, I would call you.",
      correctOption: "B",
      explanation: 'First conditional structure: "If + present simple, will + base verb" — used for realistic future situations.',
      difficulty: "MEDIUM",
    },
  ];

  let grammarCreated = 0;
  for (const q of grammarQuestions) {
    const existing = await prisma.mcqQuestion.findFirst({ where: { question: q.question } });
    if (!existing) {
      await prisma.mcqQuestion.create({
        data: { ...q, isFreeDemo: grammarCreated < 1, subjectId: ieltsGrammar.id, courseId: ieltsCourse.id, createdBy: admin.id } as any,
      });
      grammarCreated++;
    }
  }
  console.log(`${grammarCreated} IELTS Grammar MCQ(s) added`);

  console.log("\nBatch 3 done. New subjects added: Criminal Law, IELTS Grammar.");
  console.log("Total original questions across all batches: ~29.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
