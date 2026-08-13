import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// All content below is ORIGINAL — written for this platform, not copied
// from any copyrighted source (IELTS is a trademark of its owners; this
// content only follows the same general exam FORMAT, using original text).

async function main() {
  console.log("Seeding batch 5 — full IELTS sectioned mock test...");

  const admin = await prisma.user.findFirst({ where: { accountType: "COMPANY" } });
  if (!admin) {
    console.error("No COMPANY user found — run the main seed script first.");
    process.exit(1);
  }

  const ieltsCourse = await prisma.course.findFirst({ where: { name: "IELTS Preparation" } });
  if (!ieltsCourse) {
    console.error("Run seed-phase2-demo.ts first.");
    process.exit(1);
  }

  const ieltsReading = await prisma.subject.findFirst({ where: { name: "Reading", courseId: ieltsCourse.id } });
  const ieltsListening = await prisma.subject.findFirst({ where: { name: "Listening", courseId: ieltsCourse.id } });

  if (!ieltsReading || !ieltsListening) {
    console.error("Run seed-original-content-4.ts first (creates Listening subject).");
    process.exit(1);
  }

  let mockTest = await prisma.mockTest.findFirst({ where: { title: "IELTS Full Practice Test 1" } });
  if (!mockTest) {
    mockTest = await prisma.mockTest.create({
      data: {
        title: "IELTS Full Practice Test 1",
        courseId: ieltsCourse.id,
        durationMinutes: 150,
        isPublished: true,
        isFreeDemo: true,
        createdBy: admin.id,
      } as any,
    });
    console.log("Created Mock Test: IELTS Full Practice Test 1");
  } else {
    console.log("Mock Test already exists, reusing it.");
  }

  let readingSection = await prisma.testSection.findFirst({ where: { mockTestId: mockTest.id, type: "READING" } });
  if (!readingSection) {
    readingSection = await prisma.testSection.create({
      data: {
        mockTestId: mockTest.id,
        type: "READING",
        title: "Reading",
        timeLimitMinutes: 60,
        order: 1,
      },
    });
  }

  const readingQuestions = await prisma.mcqQuestion.findMany({ where: { subjectId: ieltsReading.id }, take: 6 });
  let linkedReading = 0;
  for (let i = 0; i < readingQuestions.length; i++) {
    const exists = await prisma.mockTestQuestion.findFirst({
      where: { mockTestId: mockTest.id, questionId: readingQuestions[i].id },
    });
    if (!exists) {
      await prisma.mockTestQuestion.create({
        data: { mockTestId: mockTest.id, questionId: readingQuestions[i].id, sectionId: readingSection.id, order: i + 1 },
      });
      linkedReading++;
    }
  }
  console.log(`Linked ${linkedReading} Reading question(s) to the test`);

  let listeningSection = await prisma.testSection.findFirst({ where: { mockTestId: mockTest.id, type: "LISTENING" } });
  if (!listeningSection) {
    listeningSection = await prisma.testSection.create({
      data: {
        mockTestId: mockTest.id,
        type: "LISTENING",
        title: "Listening",
        timeLimitMinutes: 30,
        order: 2,
      },
    });
  }

  const listeningQuestions = await prisma.mcqQuestion.findMany({ where: { subjectId: ieltsListening.id }, take: 6 });
  let linkedListening = 0;
  for (let i = 0; i < listeningQuestions.length; i++) {
    const exists = await prisma.mockTestQuestion.findFirst({
      where: { mockTestId: mockTest.id, questionId: listeningQuestions[i].id },
    });
    if (!exists) {
      await prisma.mockTestQuestion.create({
        data: { mockTestId: mockTest.id, questionId: listeningQuestions[i].id, sectionId: listeningSection.id, order: i + 1 },
      });
      linkedListening++;
    }
  }
  console.log(`Linked ${linkedListening} Listening question(s) to the test`);

  const writingTask1Exists = await prisma.testSection.findFirst({
    where: { mockTestId: mockTest.id, type: "WRITING", title: "Writing Task 1" },
  });
  if (!writingTask1Exists) {
    await prisma.testSection.create({
      data: {
        mockTestId: mockTest.id,
        type: "WRITING",
        title: "Writing Task 1",
        writingPrompt:
          "The chart below shows the percentage of households with internet access in four countries between 2010 and 2020. Summarize the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.",
        minWordCount: 150,
        timeLimitMinutes: 20,
        order: 3,
      },
    });
    console.log("Created Writing Task 1 section");
  }

  const writingTask2Exists = await prisma.testSection.findFirst({
    where: { mockTestId: mockTest.id, type: "WRITING", title: "Writing Task 2" },
  });
  if (!writingTask2Exists) {
    await prisma.testSection.create({
      data: {
        mockTestId: mockTest.id,
        type: "WRITING",
        title: "Writing Task 2",
        writingPrompt:
          "Some people believe that university education should be free for all students, while others think students should pay for their own education. Discuss both views and give your own opinion. Write at least 250 words.",
        minWordCount: 250,
        timeLimitMinutes: 40,
        order: 4,
      },
    });
    console.log("Created Writing Task 2 section");
  }

  const speakingExists = await prisma.testSection.findFirst({ where: { mockTestId: mockTest.id, type: "SPEAKING" } });
  if (!speakingExists) {
    await prisma.testSection.create({
      data: {
        mockTestId: mockTest.id,
        type: "SPEAKING",
        title: "Speaking",
        writingPrompt:
          "Practice topic card: Describe a place you visited that you found interesting. You should say: where it was, when you went there, what you did there, and explain why you found it interesting. " +
          "Speaking is practiced live — check the course page for scheduled Speaking practice sessions.",
        timeLimitMinutes: 15,
        order: 5,
      },
    });
    console.log("Created Speaking section");
  }

  console.log("\nBatch 5 done. 'IELTS Full Practice Test 1' now has all 4 sections:");
  console.log("Reading, Listening, Writing (Task 1 + 2), and Speaking.");
  console.log("Marked as Free Demo so students can try the full format before subscribing.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
