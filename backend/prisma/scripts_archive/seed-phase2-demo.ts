import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Phase 2 demo data (Law + IELTS courses)...");

  const admin = await prisma.user.findFirst({ where: { accountType: "COMPANY" } });
  if (!admin) {
    console.error("No COMPANY user found — run the main seed script first.");
    process.exit(1);
  }

  // --- Courses ---
  let lawCourse = await prisma.course.findFirst({ where: { name: "Law Exam Preparation" } });
  if (!lawCourse) {
    lawCourse = await prisma.course.create({
      data: {
        name: "Law Exam Preparation",
        category: "LAW",
        description: "MCQs and mock tests for LLB, Bar Council, Judicial Service, and PSC exams.",
      },
    });
  }

  let ieltsCourse = await prisma.course.findFirst({ where: { name: "IELTS Preparation" } });
  if (!ieltsCourse) {
    ieltsCourse = await prisma.course.create({
      data: {
        name: "IELTS Preparation",
        category: "LANGUAGE",
        description: "Computer-Delivered IELTS practice — Reading, Listening, Writing, Speaking.",
      },
    });
  }
  console.log(`Courses ready: ${lawCourse.name}, ${ieltsCourse.name}`);

  // --- Subjects ---
  const constitutionalLaw = await prisma.subject.upsert({
    where: { name_courseId: { name: "Constitutional Law", courseId: lawCourse.id } },
    update: {},
    create: { name: "Constitutional Law", courseId: lawCourse.id, examType: "LLB" },
  });

  const ieltsReading = await prisma.subject.upsert({
    where: { name_courseId: { name: "Reading", courseId: ieltsCourse.id } },
    update: {},
    create: { name: "Reading", courseId: ieltsCourse.id },
  });
  console.log(`Subjects ready: ${constitutionalLaw.name}, ${ieltsReading.name}`);

  // --- Sample MCQs (Law) ---
  const lawQuestions = [
    {
      question: "नेपालको संविधान कहिले जारी भएको हो?",
      optionA: "२०७२ साल असोज ३",
      optionB: "२०७२ साल साउन १",
      optionC: "२०७३ साल असोज ३",
      optionD: "२०७१ साल असोज ३",
      correctOption: "A",
      explanation: "नेपालको संविधान २०७२ साल असोज ३ गते जारी भएको हो।",
      isFreeDemo: true,
    },
    {
      question: "नेपालमा कति वटा प्रदेश छन्?",
      optionA: "५",
      optionB: "६",
      optionC: "७",
      optionD: "८",
      correctOption: "C",
      explanation: "नेपालमा हाल ७ वटा प्रदेश छन्।",
      isFreeDemo: false,
    },
  ];

  for (const q of lawQuestions) {
    const existing = await prisma.mcqQuestion.findFirst({ where: { question: q.question } });
    if (!existing) {
      await prisma.mcqQuestion.create({
        data: {
          ...q,
          examType: "LLB",
          difficulty: "MEDIUM",
          subjectId: constitutionalLaw.id,
          courseId: lawCourse.id,
          createdBy: admin.id,
        } as any,
      });
    }
  }
  console.log(`${lawQuestions.length} Law MCQ(s) ready`);

  // --- Sample MCQs (IELTS) ---
  const ieltsQuestions = [
    {
      question: 'In IELTS Reading, "skimming" refers to which technique?',
      optionA: "Reading every word carefully",
      optionB: "Reading quickly to get the general idea",
      optionC: "Reading only the last paragraph",
      optionD: "Reading aloud",
      correctOption: "B",
      explanation: "Skimming means reading quickly to understand the main idea, not every detail.",
      isFreeDemo: true,
    },
  ];

  for (const q of ieltsQuestions) {
    const existing = await prisma.mcqQuestion.findFirst({ where: { question: q.question } });
    if (!existing) {
      await prisma.mcqQuestion.create({
        data: {
          ...q,
          difficulty: "EASY",
          subjectId: ieltsReading.id,
          courseId: ieltsCourse.id,
          createdBy: admin.id,
        } as any,
      });
    }
  }
  console.log(`${ieltsQuestions.length} IELTS MCQ(s) ready`);

  // --- A sample published mock test (Law) ---
  const existingTest = await prisma.mockTest.findFirst({ where: { title: "Constitutional Law — Practice Test 1" } });
  let mockTest = existingTest;
  if (!mockTest) {
    mockTest = await prisma.mockTest.create({
      data: {
        title: "Constitutional Law — Practice Test 1",
        courseId: lawCourse.id,
        examType: "LLB",
        subjectId: constitutionalLaw.id,
        durationMinutes: 30,
        isPublished: true,
        createdBy: admin.id,
      },
    });
    const questions = await prisma.mcqQuestion.findMany({ where: { subjectId: constitutionalLaw.id } });
    await prisma.mockTestQuestion.createMany({
      data: questions.map((q, i) => ({ mockTestId: mockTest!.id, questionId: q.id, order: i })),
    });
  }
  console.log(`Mock test ready: ${mockTest.title}`);

  // --- A sample student account ---
  const studentPasswordHash = await bcrypt.hash("StudentPass123!", 12);
  const student = await prisma.user.upsert({
    where: { email: "student@test.com" },
    update: {},
    create: {
      accountType: "STUDENT",
      fullName: "Test Student",
      email: "student@test.com",
      passwordHash: studentPasswordHash,
      status: "ACTIVE",
    },
  });
  console.log(`Test student ready: ${student.email} / password: StudentPass123!`);

  // Grant this student a subscription to Law course only, so you can test
  // that IELTS content stays locked (isFreeDemo items should still show).
  await prisma.courseSubscription.upsert({
    where: { studentId_courseId: { studentId: student.id, courseId: lawCourse.id } },
    update: { status: "ACTIVE" },
    create: { studentId: student.id, courseId: lawCourse.id, status: "ACTIVE" },
  });
  console.log(`Student subscribed to: ${lawCourse.name} (IELTS should stay locked except free-demo items)`);

  console.log("\nPhase 2 demo data seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
