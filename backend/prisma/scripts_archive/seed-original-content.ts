import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// All content below is ORIGINAL — written for this platform, not copied
// from IELTS/British Council/IDP/Cambridge or any copyrighted source.
// Law questions are based on publicly available facts about Nepal's
// constitution and legal system (public information, not copyrighted text).

async function main() {
  console.log("Seeding original local-test content...");

  const admin = await prisma.user.findFirst({ where: { accountType: "COMPANY" } });
  if (!admin) {
    console.error("No COMPANY user found — run the main seed script first.");
    process.exit(1);
  }

  const lawCourse = await prisma.course.findFirst({ where: { name: "Law Exam Preparation" } });
  const ieltsCourse = await prisma.course.findFirst({ where: { name: "IELTS Preparation" } });
  if (!lawCourse || !ieltsCourse) {
    console.error("Run seed-phase2-demo.ts first (Course/Subject records missing).");
    process.exit(1);
  }

  const constLaw = await prisma.subject.findFirst({ where: { name: "Constitutional Law", courseId: lawCourse.id } });
  const ieltsReading = await prisma.subject.findFirst({ where: { name: "Reading", courseId: ieltsCourse.id } });
  if (!constLaw || !ieltsReading) {
    console.error("Required subjects missing — run seed-phase2-demo.ts first.");
    process.exit(1);
  }

  // --- Original Law MCQs (Nepal constitutional/legal facts — public information) ---
  const lawQuestions = [
    {
      question: "नेपालको संविधानको प्रस्तावनामा नेपाललाई कस्तो राज्यको रूपमा वर्णन गरिएको छ?",
      optionA: "एकात्मक राज्य",
      optionB: "समाजवाद उन्मुख संघीय लोकतान्त्रिक गणतन्त्रात्मक राज्य",
      optionC: "राजतन्त्रात्मक राज्य",
      optionD: "साम्यवादी राज्य",
      correctOption: "B",
      explanation: "नेपालको संविधानको प्रस्तावनामा नेपाललाई समाजवाद उन्मुख संघीय लोकतान्त्रिक गणतन्त्रात्मक राज्यको रूपमा उल्लेख गरिएको छ।",
      difficulty: "EASY",
    },
    {
      question: "नेपालको संघीय संसद कति सदनात्मक व्यवस्था हो?",
      optionA: "एक सदनात्मक",
      optionB: "द्विसदनात्मक",
      optionC: "त्रि सदनात्मक",
      optionD: "सदन नै छैन",
      correctOption: "B",
      explanation: "नेपालको संघीय संसद प्रतिनिधि सभा र राष्ट्रिय सभा गरी द्विसदनात्मक व्यवस्था हो।",
      difficulty: "EASY",
    },
    {
      question: "नेपालको सर्वोच्च अदालतमा प्रधानन्यायाधीश बाहेक बढीमा कति जना न्यायाधीश रहन सक्छन्?",
      optionA: "१५",
      optionB: "१८",
      optionC: "२०",
      optionD: "२५",
      correctOption: "C",
      explanation: "संविधान बमोजिम सर्वोच्च अदालतमा प्रधानन्यायाधीश बाहेक बढीमा २० जना न्यायाधीश रहन सक्छन्।",
      difficulty: "MEDIUM",
    },
    {
      question: "मुलुकी देवानी संहिता कुन साल जारी भएको हो?",
      optionA: "२०७२",
      optionB: "२०७३",
      optionC: "२०७४",
      optionD: "२०७५",
      correctOption: "C",
      explanation: "मुलुकी देवानी संहिता, २०७४ साल जारी भई २०७५ साल असोज १ गतेदेखि लागू भएको हो।",
      difficulty: "MEDIUM",
    },
    {
      question: "नेपालको संविधान अनुसार मौलिक हकको उल्लंघन भएमा कुन अदालतमा सीधा निवेदन दिन सकिन्छ?",
      optionA: "जिल्ला अदालत",
      optionB: "उच्च अदालत",
      optionC: "सर्वोच्च अदालत",
      optionD: "कुनै पनि अदालतमा दिन मिल्दैन",
      correctOption: "C",
      explanation: "संविधानको धारा १३३ बमोजिम मौलिक हक हनन भएमा सीधा सर्वोच्च अदालतमा रिट निवेदन दिन सकिन्छ।",
      difficulty: "MEDIUM",
    },
  ];

  let created = 0;
  for (const q of lawQuestions) {
    const existing = await prisma.mcqQuestion.findFirst({ where: { question: q.question } });
    if (!existing) {
      await prisma.mcqQuestion.create({
        data: { ...q, examType: "LLB", isFreeDemo: created < 2, subjectId: constLaw.id, courseId: lawCourse.id, createdBy: admin.id } as any,
      });
      created++;
    }
  }
  console.log(`${created} Law MCQ(s) added`);

  // --- Original IELTS-style Reading MCQs (original short passage + questions, not copied) ---
  const passage =
    "Urban beekeeping has grown quickly in cities around the world over the past decade. Once considered unusual, rooftop hives are now found on office buildings, hotels, and even schools. Supporters argue that city bees benefit from a wider variety of flowering plants than bees in intensively farmed rural areas, where a single crop often dominates the landscape. City temperatures also tend to be slightly higher, which can extend the foraging season. However, critics point out that placing too many hives in one area can create competition for limited flowers, potentially harming wild pollinator populations. Researchers now recommend that cities set clear limits on hive density and encourage residents to plant more flowering species to support all pollinators, not just honeybees.";

  const ieltsQuestions = [
    {
      question: `Reading Passage: "${passage}"\n\nAccording to the passage, why might city bees have access to a wider variety of flowers than rural bees?`,
      optionA: "Cities have fewer bees overall",
      optionB: "Rural areas are often dominated by a single crop",
      optionC: "Cities ban single-crop farming",
      optionD: "Rural bees prefer fewer flower types",
      correctOption: "B",
      explanation: "The passage states rural areas dominated by a single crop offer less variety than cities.",
      difficulty: "MEDIUM",
    },
    {
      question: `Reading Passage: "${passage}"\n\nWhat concern do critics raise about urban beekeeping?`,
      optionA: "Bees cannot survive in cities",
      optionB: "Too many hives can create competition harming wild pollinators",
      optionC: "Rooftop hives are illegal in most cities",
      optionD: "City honey is lower quality",
      correctOption: "B",
      explanation: "Critics warn that too many hives in one area can compete for limited flowers, harming wild pollinators.",
      difficulty: "MEDIUM",
    },
    {
      question: `Reading Passage: "${passage}"\n\nWhat do researchers recommend cities do?`,
      optionA: "Ban all beekeeping",
      optionB: "Set hive density limits and encourage more flowering plants",
      optionC: "Only allow beekeeping in rural areas",
      optionD: "Remove all rooftop gardens",
      correctOption: "B",
      explanation: "The passage states researchers recommend hive density limits and more flowering species for all pollinators.",
      difficulty: "MEDIUM",
    },
  ];

  let ieltsCreated = 0;
  for (const q of ieltsQuestions) {
    const existing = await prisma.mcqQuestion.findFirst({ where: { question: q.question } });
    if (!existing) {
      await prisma.mcqQuestion.create({
        data: { ...q, isFreeDemo: ieltsCreated < 1, subjectId: ieltsReading.id, courseId: ieltsCourse.id, createdBy: admin.id } as any,
      });
      ieltsCreated++;
    }
  }
  console.log(`${ieltsCreated} IELTS Reading MCQ(s) added`);

  console.log("\nDone. This is a small original starter set for local testing —");
  console.log("bulk content (hundreds of questions) needs a dedicated content-writing effort later.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
