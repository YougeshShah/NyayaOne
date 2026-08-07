import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// All content below is ORIGINAL — written for this platform, not copied
// from any copyrighted source. Law questions are based on publicly
// available facts about Nepal's legal system.

async function main() {
  console.log("Seeding batch 2 of original content...");

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
  const ieltsReading = await prisma.subject.findFirst({ where: { name: "Reading", courseId: ieltsCourse.id } });
  if (!constLaw || !ieltsReading) {
    console.error("Required subjects missing.");
    process.exit(1);
  }

  const lawQuestions = [
    {
      question: "नेपालको संविधान अनुसार कति वटा प्रदेश छन्?",
      optionA: "५",
      optionB: "६",
      optionC: "७",
      optionD: "८",
      correctOption: "C",
      explanation: "नेपालको संविधान, २०७२ ले नेपाललाई ७ वटा प्रदेशमा विभाजन गरेको छ।",
      difficulty: "EASY",
    },
    {
      question: "नेपालको राष्ट्रपतिको कार्यकाल कति वर्षको हुन्छ?",
      optionA: "४ वर्ष",
      optionB: "५ वर्ष",
      optionC: "६ वर्ष",
      optionD: "७ वर्ष",
      correctOption: "B",
      explanation: "संविधान बमोजिम राष्ट्रपतिको कार्यकाल ५ वर्षको हुन्छ।",
      difficulty: "EASY",
    },
    {
      question: "नेपालको संविधान संशोधन गर्न प्रतिनिधि सभामा कति बहुमत चाहिन्छ?",
      optionA: "साधारण बहुमत",
      optionB: "दुई तिहाई बहुमत",
      optionC: "तीन चौथाई बहुमत",
      optionD: "सर्वसम्मति",
      correctOption: "B",
      explanation: "संविधान संशोधन गर्न संघीय संसदको दुवै सदनमा कुल सदस्य संख्याको दुई तिहाई बहुमत आवश्यक पर्छ।",
      difficulty: "MEDIUM",
    },
    {
      question: "मुलुकी अपराध संहिता कुन सालदेखि लागू भएको हो?",
      optionA: "२०७३",
      optionB: "२०७४",
      optionC: "२०७५",
      optionD: "२०७६",
      correctOption: "C",
      explanation: "मुलुकी अपराध संहिता, २०७४ जारी भई २०७५ साल असोज १ गतेदेखि लागू भएको हो।",
      difficulty: "MEDIUM",
    },
    {
      question: "नेपालको संविधानले कति वटा मौलिक हकको व्यवस्था गरेको छ?",
      optionA: "२५",
      optionB: "२८",
      optionC: "३१",
      optionD: "३५",
      correctOption: "D",
      explanation: "नेपालको संविधानको भाग ३ मा ३५ वटा मौलिक हकहरूको व्यवस्था गरिएको छ।",
      difficulty: "HARD",
    },
    {
      question: "बाल न्याय ऐन अनुसार बालकको उमेर हद कति वर्ष तोकिएको छ?",
      optionA: "१४ वर्ष मुनि",
      optionB: "१६ वर्ष मुनि",
      optionC: "१८ वर्ष मुनि",
      optionD: "२१ वर्ष मुनि",
      correctOption: "C",
      explanation: "बाल न्याय (सुधार तथा संरक्षण) ऐन अनुसार १८ वर्ष उमेर नपुगेको व्यक्तिलाई बालक मानिन्छ।",
      difficulty: "MEDIUM",
    },
    {
      question: "सर्वोच्च अदालतको प्रधानन्यायाधीशलाई कसले नियुक्ति गर्छ?",
      optionA: "प्रधानमन्त्री",
      optionB: "राष्ट्रपति (न्याय परिषदको सिफारिसमा)",
      optionC: "संघीय संसद",
      optionD: "सभामुख",
      correctOption: "B",
      explanation: "संविधान अनुसार न्याय परिषदको सिफारिसमा राष्ट्रपतिले प्रधानन्यायाधीश नियुक्ति गर्छन्।",
      difficulty: "MEDIUM",
    },
  ];

  let created = 0;
  for (const q of lawQuestions) {
    const existing = await prisma.mcqQuestion.findFirst({ where: { question: q.question } });
    if (!existing) {
      await prisma.mcqQuestion.create({
        data: { ...q, examType: "LLB", isFreeDemo: false, subjectId: constLaw.id, courseId: lawCourse.id, createdBy: admin.id } as any,
      });
      created++;
    }
  }
  console.log(`${created} Law MCQ(s) added`);

  const passage2 =
    "Remote work has reshaped commuting patterns in many cities. Before widespread adoption of home-based work, transit systems were designed around predictable rush-hour peaks, with most infrastructure investment aimed at moving large numbers of commuters within a narrow morning and evening window. As more employees split their week between home and office, ridership has become more evenly distributed across the day, though overall passenger numbers on some lines remain below pre-pandemic levels. Transit agencies now face a difficult trade-off: reducing service to match lower demand risks making public transport less convenient for the commuters who remain, potentially pushing them toward private vehicles, while maintaining full service despite falling revenue strains already tight budgets. Some cities have responded by shifting investment toward more flexible, on-demand transit options rather than fixed high-capacity routes.";

  const ieltsQuestions2 = [
    {
      question: `Reading Passage: "${passage2}"\n\nHow were transit systems traditionally designed, according to the passage?`,
      optionA: "Around even demand throughout the day",
      optionB: "Around predictable rush-hour peaks",
      optionC: "Primarily for weekend travel",
      optionD: "Without considering commuter numbers",
      correctOption: "B",
      explanation: "The passage states transit systems were designed around predictable rush-hour peaks.",
      difficulty: "MEDIUM",
    },
    {
      question: `Reading Passage: "${passage2}"\n\nWhat risk is associated with reducing transit service to match lower demand?`,
      optionA: "It could push remaining commuters toward private vehicles",
      optionB: "It would increase agency revenue immediately",
      optionC: "It has no effect on commuters",
      optionD: "It would only affect weekend service",
      correctOption: "A",
      explanation: "The passage explains reducing service risks pushing remaining commuters toward private vehicles.",
      difficulty: "MEDIUM",
    },
    {
      question: `Reading Passage: "${passage2}"\n\nHow have some cities responded to changing ridership patterns?`,
      optionA: "By closing all transit lines",
      optionB: "By shifting investment toward flexible, on-demand transit options",
      optionC: "By increasing fixed high-capacity routes only",
      optionD: "By banning remote work",
      correctOption: "B",
      explanation: "The passage states some cities shifted investment toward more flexible, on-demand transit options.",
      difficulty: "MEDIUM",
    },
  ];

  let ieltsCreated = 0;
  for (const q of ieltsQuestions2) {
    const existing = await prisma.mcqQuestion.findFirst({ where: { question: q.question } });
    if (!existing) {
      await prisma.mcqQuestion.create({
        data: { ...q, isFreeDemo: false, subjectId: ieltsReading.id, courseId: ieltsCourse.id, createdBy: admin.id } as any,
      });
      ieltsCreated++;
    }
  }
  console.log(`${ieltsCreated} IELTS Reading MCQ(s) added`);

  console.log("\nBatch 2 done. Total original questions across both batches: ~18.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
