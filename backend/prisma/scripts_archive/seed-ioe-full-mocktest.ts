import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Builds a mock test matching the REAL IOE Entrance structure:
//   - 100 questions total, 140 marks
//   - Part A: 60 questions x 1 mark = 60 marks
//   - Part B: 40 questions x 2 marks = 80 marks
//   - 2 hour duration
//   - 10% negative marking (approximate -- verify against the current
//     year's official notice, as this has varied 5-10% across years)
//
// Since the simple "random pull" creation tool only supports ONE uniform
// mark value per test, this script builds the mixed-weight structure
// directly, then randomly assigns available questions into Part A / Part B.

async function main() {
  const admin = await prisma.user.findFirst({ where: { accountType: "COMPANY" } });
  if (!admin) {
    console.error("No COMPANY user found -- run the main seed script first.");
    process.exit(1);
  }

  const ioeCourse = await prisma.course.findFirst({ where: { name: "IOE Entrance Preparation" } });
  if (!ioeCourse) {
    console.error("IOE Entrance Preparation course not found.");
    process.exit(1);
  }

  let test = await prisma.mockTest.findFirst({ where: { title: "IOE Entrance Full Mock Test 1" } });
  if (!test) {
    test = await prisma.mockTest.create({
      data: {
        title: "IOE Entrance Full Mock Test 1",
        courseId: ioeCourse.id,
        durationMinutes: 120,
        negativeMarkingPercent: 10,
        isPublished: true,
        createdBy: admin.id,
      },
    });
    console.log("Created Mock Test: IOE Entrance Full Mock Test 1 (120 min, 10% negative marking)");
  }

  const existingQuestionCount = await prisma.mockTestQuestion.count({ where: { mockTestId: test.id } });
  if (existingQuestionCount > 0) {
    console.log(`This mock test already has ${existingQuestionCount} question(s) -- skipping question assignment.`);
    console.log("Delete the existing MockTestQuestion rows first if you want to rebuild it.");
    return;
  }

  const allQuestions = await prisma.mcqQuestion.findMany({
    where: { courseId: ioeCourse.id },
    select: { id: true },
  });

  if (allQuestions.length === 0) {
    console.error("No IOE questions found in the question bank -- add questions first.");
    process.exit(1);
  }

  const shuffled = allQuestions.sort(() => Math.random() - 0.5);
  // Real proportions would need 60+40=100 questions; use whatever is
  // available, keeping roughly a 60:40 split between 1-mark and 2-mark items.
  const partACount = Math.ceil(shuffled.length * 0.6);
  const partA = shuffled.slice(0, partACount);
  const partB = shuffled.slice(partACount);

  await prisma.mockTestQuestion.createMany({
    data: [
      ...partA.map((q, i) => ({ mockTestId: test!.id, questionId: q.id, order: i, marks: 1 })),
      ...partB.map((q, i) => ({ mockTestId: test!.id, questionId: q.id, order: partA.length + i, marks: 2 })),
    ],
  });

  console.log(`\nDone. Assigned ${partA.length} question(s) at 1 mark (Part A) and ${partB.length} question(s) at 2 marks (Part B).`);
  console.log(`Total possible marks: ${partA.length * 1 + partB.length * 2}`);
  console.log("\nNote: real IOE has exactly 60 Part A + 40 Part B questions (100 total, 140 marks).");
  console.log("This mock test will use fewer until more IOE questions are added to the bank --");
  console.log("re-run this script (after clearing MockTestQuestion for this test) once more content exists.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
