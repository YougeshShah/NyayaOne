import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findFirst({ where: { accountType: "COMPANY" } });
  if (!admin) {
    console.error("No COMPANY user found -- run the main seed script first.");
    process.exit(1);
  }

  const medicalCourse = await prisma.course.findFirst({ where: { name: "Medical Entrance Preparation" } });
  if (!medicalCourse) {
    console.error("Medical Entrance Preparation course not found.");
    process.exit(1);
  }

  let test = await prisma.mockTest.findFirst({ where: { title: "MECEE-BL Full Mock Test 1" } });
  if (!test) {
    test = await prisma.mockTest.create({
      data: {
        title: "MECEE-BL Full Mock Test 1",
        courseId: medicalCourse.id,
        durationMinutes: 180,
        negativeMarkingPercent: 25,
        isPublished: true,
        createdBy: admin.id,
      },
    });
    console.log("Created Mock Test: MECEE-BL Full Mock Test 1 (180 min, 25% negative marking, 1 mark/question)");
  }

  const existingQuestionCount = await prisma.mockTestQuestion.count({ where: { mockTestId: test.id } });
  if (existingQuestionCount > 0) {
    console.log("This mock test already has " + existingQuestionCount + " question(s) -- skipping question assignment.");
    return;
  }

  const allQuestions = await prisma.mcqQuestion.findMany({
    where: { courseId: medicalCourse.id },
    select: { id: true },
  });

  if (allQuestions.length === 0) {
    console.error("No Medical questions found in the question bank -- add questions first.");
    process.exit(1);
  }

  const shuffled = allQuestions.sort(() => Math.random() - 0.5);

  await prisma.mockTestQuestion.createMany({
    data: shuffled.map((q, i) => ({ mockTestId: test!.id, questionId: q.id, order: i, marks: 1 })),
  });

  console.log("\nDone. Assigned " + shuffled.length + " question(s) at 1 mark each.");
  console.log("\nNote: real MECEE-BL has exactly 200 questions (Biology 80, Chemistry 50,");
  console.log("Physics 50, Mental Ability Test 20). This mock test will use fewer until");
  console.log("more Medical questions are added -- re-run after clearing MockTestQuestion.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
