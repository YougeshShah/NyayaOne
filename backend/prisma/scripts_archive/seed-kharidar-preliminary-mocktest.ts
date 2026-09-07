import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Real Kharidar Preliminary (Pre-test) structure:
//   - 50 MCQ questions, 2 marks each = 100 marks total
//   - 45 minutes
//   - 20% negative marking (of the question's own marks) for a wrong
//     (attempted) answer -- no penalty for leaving a question blank
//   - Topics: General Knowledge, IQ, Management, Mental Ability

async function main() {
  const admin = await prisma.user.findFirst({ where: { accountType: "COMPANY" } });
  if (!admin) {
    console.error("No COMPANY user found -- run the main seed script first.");
    process.exit(1);
  }

  const loksewaCourse = await prisma.course.findFirst({ where: { name: "Loksewa Preparation" } });
  if (!loksewaCourse) {
    console.error("Loksewa Preparation course not found.");
    process.exit(1);
  }

  let test = await prisma.mockTest.findFirst({ where: { title: "Kharidar Preliminary Mock Test 1" } });
  if (!test) {
    test = await prisma.mockTest.create({
      data: {
        title: "Kharidar Preliminary Mock Test 1",
        courseId: loksewaCourse.id,
        examType: "KHARIDAR" as any,
        durationMinutes: 45,
        negativeMarkingPercent: 20,
        isPublished: true,
        createdBy: admin.id,
      },
    });
    console.log("Created Mock Test: Kharidar Preliminary Mock Test 1 (45 min, 20% negative marking, 2 marks/question)");
  }

  const existingQuestionCount = await prisma.mockTestQuestion.count({ where: { mockTestId: test.id } });
  if (existingQuestionCount > 0) {
    console.log("This mock test already has " + existingQuestionCount + " question(s) -- skipping question assignment.");
    return;
  }

  const allQuestions = await prisma.mcqQuestion.findMany({
    where: { courseId: loksewaCourse.id },
    select: { id: true },
  });

  if (allQuestions.length === 0) {
    console.error("No Loksewa questions found in the question bank -- add questions first.");
    process.exit(1);
  }

  const shuffled = allQuestions.sort(() => Math.random() - 0.5);

  await prisma.mockTestQuestion.createMany({
    data: shuffled.map((q, i) => ({ mockTestId: test!.id, questionId: q.id, order: i, marks: 2 })),
  });

  console.log("\nDone. Assigned " + shuffled.length + " question(s) at 2 marks each.");
  console.log("\nNote: real Kharidar Preliminary has exactly 50 questions (100 marks). This mock");
  console.log("test will use fewer until more Loksewa questions are added -- re-run after");
  console.log("clearing MockTestQuestion for this test once more content exists.");
  console.log("\nStage 2 (written, subjective short/long answer papers) is NOT covered by this");
  console.log("mock test -- the platform's MCQ-only mock test system doesn't support subjective");
  console.log("grading yet. That would be a separate, larger feature if needed later.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
