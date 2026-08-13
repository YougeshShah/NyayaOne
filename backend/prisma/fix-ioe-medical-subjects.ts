import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Adding missing subjects to match real Nepal exam structure...");

  const ioeCourse = await prisma.course.findFirst({ where: { name: "IOE Entrance Preparation" } });
  const medicalCourse = await prisma.course.findFirst({ where: { name: "Medical Entrance Preparation" } });

  if (!ioeCourse || !medicalCourse) {
    console.error("IOE or Medical course not found -- run seed-new-sectors.ts first.");
    process.exit(1);
  }

  async function ensureSubject(name: string, courseId: string) {
    let subject = await prisma.subject.findFirst({ where: { name, courseId } });
    if (!subject) {
      subject = await prisma.subject.create({ data: { name, courseId } });
      console.log(`Created subject: ${name}`);
    }
    return subject;
  }

  // Real IOE Entrance pattern: Mathematics (50 marks), Physics (40 marks),
  // Chemistry (30 marks), English (20 marks) -- 100 questions, 140 marks,
  // 2 hours, negative marking. English was missing entirely before.
  await ensureSubject("English", ioeCourse.id);

  // Real MECEE-BL / CEE pattern: Biology (80 marks: Zoology 40 + Botany 40),
  // Chemistry (50 marks), Physics (50 marks), Mental Ability Test (20 marks)
  // -- 200 questions, 200 marks, 3 hours, 0.25 negative marking per wrong
  // answer. Mental Ability Test was missing entirely before.
  await ensureSubject("Mental Ability Test", medicalCourse.id);

  console.log("\nDone. IOE and Medical now have all subjects matching the real exam structure.");
  console.log("\nNOTE: Real IOE/Medical exams use per-question mark weighting and negative");
  console.log("marking (IOE: ~5-10%, Medical: 0.25 per wrong answer). The current mock test");
  console.log("scoring is simple correct/total percentage -- weighted + negative-marking");
  console.log("scoring is a separate, larger change if you want full exam fidelity.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
