import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// All content below is ORIGINAL — written for this platform, not copied
// from any copyrighted source. Law questions are based on publicly
// available facts about Nepal's legal system.

async function main() {
  console.log("Seeding batch 4 of original content...");

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

  let ieltsListening = await prisma.subject.findFirst({ where: { name: "Listening", courseId: ieltsCourse.id } });
  if (!ieltsListening) {
    ieltsListening = await prisma.subject.create({ data: { name: "Listening", courseId: ieltsCourse.id } });
  }

  let ieltsWriting = await prisma.subject.findFirst({ where: { name: "Writing", courseId: ieltsCourse.id } });
  if (!ieltsWriting) {
    ieltsWriting = await prisma.subject.create({ data: { name: "Writing", courseId: ieltsCourse.id } });
  }

  const constLawQuestions = [
    {
      question: "नेपालको संविधानको धारा १८ ले कुन हकको व्यवस्था गर्छ?",
      optionA: "समानताको हक",
      optionB: "स्वतन्त्रताको हक",
      optionC: "सूचनाको हक",
      optionD: "शिक्षाको हक",
      correctOption: "A",
      explanation: "संविधानको धारा १८ ले समानताको हक (Right to Equality) को व्यवस्था गर्छ।",
      difficulty: "MEDIUM",
      subjectId: constLaw?.id,
    },
    {
      question: "नेपालको संविधान संशोधन गर्ने प्रक्रिया कुन धारामा उल्लेख छ?",
      optionA: "धारा २७४",
      optionB: "धारा २५०",
      optionC: "धारा ३००",
      optionD: "धारा १००",
      correctOption: "A",
      explanation: "संविधानको धारा २७४ ले संविधान संशोधनको प्रक्रिया तोकेको छ।",
      difficulty: "HARD",
      subjectId: constLaw?.id,
    },
    {
      question: "आपतकालीन अवस्था घोषणा गर्ने अधिकार कसलाई छ?",
      optionA: "प्रधानमन्त्री",
      optionB: "राष्ट्रपति (मन्त्रिपरिषदको सिफारिसमा)",
      optionC: "सर्वोच्च अदालत",
      optionD: "प्रदेश प्रमुख",
      correctOption: "B",
      explanation: "संविधान बमोजिम मन्त्रिपरिषदको सिफारिसमा राष्ट्रपतिले आपतकालीन अवस्था घोषणा गर्न सक्छन्।",
      difficulty: "MEDIUM",
      subjectId: constLaw?.id,
    },
  ];

  let constCreated = 0;
  if (constLaw) {
    for (const q of constLawQuestions) {
      const existing = await prisma.mcqQuestion.findFirst({ where: { question: q.question } });
      if (!existing) {
        await prisma.mcqQuestion.create({
          data: { ...q, examType: "LLB", isFreeDemo: false, courseId: lawCourse.id, createdBy: admin.id } as any,
        });
        constCreated++;
      }
    }
  }
  console.log(`${constCreated} more Constitutional Law MCQ(s) added`);

  const criminalQuestions = [
    {
      question: "मुद्दाको अनुसन्धान गर्ने प्राथमिक जिम्मेवारी कसको हुन्छ?",
      optionA: "नेपाल प्रहरी",
      optionB: "सर्वोच्च अदालत",
      optionC: "राष्ट्रपति",
      optionD: "संसद",
      correctOption: "A",
      explanation: "फौजदारी मुद्दाको प्रारम्भिक अनुसन्धान गर्ने जिम्मेवारी नेपाल प्रहरीको हुन्छ।",
      difficulty: "EASY",
    },
    {
      question: "कुनै व्यक्तिलाई सजाय दिनु अघि निजलाई सुनुवाइको मौका दिनुपर्छ भन्ने सिद्धान्तलाई के भनिन्छ?",
      optionA: "Natural Justice (प्राकृतिक न्याय)",
      optionB: "Strict Liability",
      optionC: "Res Judicata",
      optionD: "Double Jeopardy",
      correctOption: "A",
      explanation: "Natural Justice सिद्धान्त अनुसार कसैलाई पनि सुनुवाइको मौका नदिई सजाय दिन मिल्दैन।",
      difficulty: "MEDIUM",
    },
  ];

  let criminalCreated = 0;
  if (criminalLaw) {
    for (const q of criminalQuestions) {
      const existing = await prisma.mcqQuestion.findFirst({ where: { question: q.question } });
      if (!existing) {
        await prisma.mcqQuestion.create({
          data: { ...q, examType: "LLB", isFreeDemo: false, subjectId: criminalLaw.id, courseId: lawCourse.id, createdBy: admin.id } as any,
        });
        criminalCreated++;
      }
    }
  }
  console.log(`${criminalCreated} more Criminal Law MCQ(s) added`);

  const listeningScenario =
    'Audio Transcript (simulated): "Welcome to the campus library orientation. The library is open from 8 AM to 10 PM on weekdays, and 9 AM to 6 PM on weekends. First-year students can borrow up to five books at a time for a two-week period. The quiet study area is located on the third floor, while group study rooms can be booked online up to 48 hours in advance."';

  const listeningQuestions = [
    {
      question: `${listeningScenario}\n\nHow many books can a first-year student borrow at once?`,
      optionA: "Three",
      optionB: "Five",
      optionC: "Ten",
      optionD: "Unlimited",
      correctOption: "B",
      explanation: "The transcript states first-year students can borrow up to five books at a time.",
      difficulty: "EASY",
    },
    {
      question: `${listeningScenario}\n\nHow far in advance must group study rooms be booked?`,
      optionA: "24 hours",
      optionB: "48 hours",
      optionC: "One week",
      optionD: "No advance booking needed",
      correctOption: "B",
      explanation: "The transcript states group study rooms can be booked online up to 48 hours in advance.",
      difficulty: "MEDIUM",
    },
    {
      question: `${listeningScenario}\n\nWhere is the quiet study area located?`,
      optionA: "First floor",
      optionB: "Second floor",
      optionC: "Third floor",
      optionD: "Basement",
      correctOption: "C",
      explanation: "The transcript states the quiet study area is located on the third floor.",
      difficulty: "EASY",
    },
  ];

  let listeningCreated = 0;
  for (const q of listeningQuestions) {
    const existing = await prisma.mcqQuestion.findFirst({ where: { question: q.question } });
    if (!existing) {
      await prisma.mcqQuestion.create({
        data: { ...q, isFreeDemo: listeningCreated < 1, subjectId: ieltsListening.id, courseId: ieltsCourse.id, createdBy: admin.id } as any,
      });
      listeningCreated++;
    }
  }
  console.log(`${listeningCreated} IELTS Listening MCQ(s) added`);

  if (ieltsReading) {
    const passage3 =
      "Vertical farming, growing crops in stacked layers within controlled indoor environments, has attracted significant investment over the past decade. Proponents argue it can produce food closer to urban consumers, reducing transport emissions and enabling year-round harvests unaffected by weather. Critics point to the high energy cost of artificial lighting and climate control, which can offset environmental benefits unless powered by renewable sources. Most current vertical farms focus on leafy greens and herbs, crops with short growing cycles and low light requirements, rather than staple grains, which remain far more efficient to grow conventionally at scale.";

    const readingQuestions3 = [
      {
        question: `Reading Passage: "${passage3}"\n\nWhat do critics say about vertical farming's energy use?`,
        optionA: "It has no energy cost at all",
        optionB: "High energy costs can offset environmental benefits unless renewable energy is used",
        optionC: "Energy costs are lower than conventional farming",
        optionD: "Energy is not a concern for critics",
        correctOption: "B",
        explanation: "The passage states high energy costs can offset environmental benefits unless powered by renewable sources.",
        difficulty: "MEDIUM",
      },
      {
        question: `Reading Passage: "${passage3}"\n\nWhat crops do most current vertical farms focus on?`,
        optionA: "Staple grains like wheat and rice",
        optionB: "Leafy greens and herbs",
        optionC: "Fruit trees",
        optionD: "Root vegetables",
        correctOption: "B",
        explanation: "The passage states most vertical farms focus on leafy greens and herbs due to short growing cycles and low light needs.",
        difficulty: "EASY",
      },
    ];

    let reading3Created = 0;
    for (const q of readingQuestions3) {
      const existing = await prisma.mcqQuestion.findFirst({ where: { question: q.question } });
      if (!existing) {
        await prisma.mcqQuestion.create({
          data: { ...q, isFreeDemo: false, subjectId: ieltsReading.id, courseId: ieltsCourse.id, createdBy: admin.id } as any,
        });
        reading3Created++;
      }
    }
    console.log(`${reading3Created} more IELTS Reading MCQ(s) added`);
  }

  console.log("\nBatch 4 done. New subjects: IELTS Listening, IELTS Writing.");
  console.log("Note: IELTS Writing has no MCQs by design (it's an essay task) —");
  console.log("use the Company Web 'Mock Tests > Sections' tool to add a WRITING");
  console.log("section with a prompt for students to practice essay writing.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
