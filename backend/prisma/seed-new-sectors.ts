import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// All content below is ORIGINAL — written for this platform, not copied
// from any copyrighted source. Based on publicly known facts about these
// exam formats in Nepal.

async function main() {
  console.log("Seeding new sectors — Loksewa, IOE, Medical...");

  const admin = await prisma.user.findFirst({ where: { accountType: "COMPANY" } });
  if (!admin) {
    console.error("No COMPANY user found — run the main seed script first.");
    process.exit(1);
  }

  // --- Courses ---
  let loksewaCourse = await prisma.course.findFirst({ where: { name: "Loksewa Preparation" } });
  if (!loksewaCourse) {
    loksewaCourse = await prisma.course.create({
      data: {
        name: "Loksewa Preparation",
        category: "GOVERNMENT_SERVICE" as any,
        description: "MCQs and mock tests for Nepal's Public Service Commission (Loksewa Aayog) exams.",
      },
    });
    console.log("Created course: Loksewa Preparation");
  }

  let ioeCourse = await prisma.course.findFirst({ where: { name: "IOE Entrance Preparation" } });
  if (!ioeCourse) {
    ioeCourse = await prisma.course.create({
      data: {
        name: "IOE Entrance Preparation",
        category: "ENGINEERING" as any,
        description: "MCQs and mock tests for Institute of Engineering (IOE) entrance exams.",
      },
    });
    console.log("Created course: IOE Entrance Preparation");
  }

  let medicalCourse = await prisma.course.findFirst({ where: { name: "Medical Entrance Preparation" } });
  if (!medicalCourse) {
    medicalCourse = await prisma.course.create({
      data: {
        name: "Medical Entrance Preparation",
        category: "MEDICAL" as any,
        description: "MCQs and mock tests for MBBS/BDS and other medical entrance exams.",
      },
    });
    console.log("Created course: Medical Entrance Preparation");
  }

  // --- Subjects ---
  async function ensureSubject(name: string, courseId: string) {
    let subject = await prisma.subject.findFirst({ where: { name, courseId } });
    if (!subject) {
      subject = await prisma.subject.create({ data: { name, courseId } });
    }
    return subject;
  }

  const loksewaGK = await ensureSubject("General Knowledge", loksewaCourse.id);
  const loksewaConstitution = await ensureSubject("Nepal Constitution & Governance", loksewaCourse.id);
  const ioePhysics = await ensureSubject("Physics", ioeCourse.id);
  const ioeMath = await ensureSubject("Mathematics", ioeCourse.id);
  const medBiology = await ensureSubject("Biology", medicalCourse.id);
  const medChemistry = await ensureSubject("Chemistry", medicalCourse.id);

  let total = 0;
  async function addQuestions(subjectId: string, courseId: string, questions: any[]) {
    let created = 0;
    for (const q of questions) {
      const existing = await prisma.mcqQuestion.findFirst({ where: { question: q.question } });
      if (!existing) {
        await prisma.mcqQuestion.create({ data: { ...q, subjectId, courseId, createdBy: admin!.id } as any });
        created++;
      }
    }
    total += created;
    return created;
  }

  // --- Loksewa: General Knowledge ---
  console.log(
    `${await addQuestions(loksewaGK.id, loksewaCourse.id, [
      {
        question: "नेपालको राष्ट्रिय फूल के हो?",
        optionA: "गुराँस",
        optionB: "कमल",
        optionC: "सूर्यमुखी",
        optionD: "पदम",
        correctOption: "A",
        explanation: "गुराँस (Rhododendron) नेपालको राष्ट्रिय फूल हो।",
        difficulty: "EASY",
        isFreeDemo: true,
      },
      {
        question: "नेपालको सबैभन्दा अग्लो हिमाल कुन हो?",
        optionA: "अन्नपूर्ण",
        optionB: "सगरमाथा",
        optionC: "मनास्लु",
        optionD: "धौलागिरी",
        correctOption: "B",
        explanation: "सगरमाथा (Mount Everest) संसारकै अग्लो हिमाल हो, नेपालमा अवस्थित।",
        difficulty: "EASY",
        isFreeDemo: false,
      },
    ])} Loksewa GK questions added`
  );

  // --- Loksewa: Constitution ---
  console.log(
    `${await addQuestions(loksewaConstitution.id, loksewaCourse.id, [
      {
        question: "नेपालको संविधानमा कति वटा अनुसूची छन्?",
        optionA: "७",
        optionB: "९",
        optionC: "११",
        optionD: "१०",
        correctOption: "C",
        explanation: "नेपालको संविधानमा जम्मा ११ वटा अनुसूची छन्।",
        difficulty: "MEDIUM",
        isFreeDemo: false,
      },
    ])} Loksewa Constitution questions added`
  );

  // --- IOE: Physics ---
  console.log(
    `${await addQuestions(ioePhysics.id, ioeCourse.id, [
      {
        question: "SI unit of force is:",
        optionA: "Joule",
        optionB: "Newton",
        optionC: "Watt",
        optionD: "Pascal",
        correctOption: "B",
        explanation: "Force is measured in Newtons (N) in the SI system.",
        difficulty: "EASY",
        isFreeDemo: true,
      },
      {
        question: "The speed of light in vacuum is approximately:",
        optionA: "3 × 10^8 m/s",
        optionB: "3 × 10^6 m/s",
        optionC: "3 × 10^5 m/s",
        optionD: "3 × 10^10 m/s",
        correctOption: "A",
        explanation: "The speed of light in vacuum is approximately 3 × 10^8 meters per second.",
        difficulty: "EASY",
        isFreeDemo: false,
      },
    ])} IOE Physics questions added`
  );

  // --- IOE: Mathematics ---
  console.log(
    `${await addQuestions(ioeMath.id, ioeCourse.id, [
      {
        question: "The derivative of sin(x) with respect to x is:",
        optionA: "cos(x)",
        optionB: "-cos(x)",
        optionC: "-sin(x)",
        optionD: "tan(x)",
        correctOption: "A",
        explanation: "d/dx[sin(x)] = cos(x), a standard calculus derivative.",
        difficulty: "MEDIUM",
        isFreeDemo: true,
      },
    ])} IOE Math questions added`
  );

  // --- Medical: Biology ---
  console.log(
    `${await addQuestions(medBiology.id, medicalCourse.id, [
      {
        question: "The powerhouse of the cell is the:",
        optionA: "Nucleus",
        optionB: "Ribosome",
        optionC: "Mitochondria",
        optionD: "Golgi apparatus",
        correctOption: "C",
        explanation: "Mitochondria produce ATP through cellular respiration, earning the nickname 'powerhouse of the cell'.",
        difficulty: "EASY",
        isFreeDemo: true,
      },
      {
        question: "DNA replication is described as semi-conservative because:",
        optionA: "Only half the DNA is copied",
        optionB: "Each new DNA molecule has one original and one new strand",
        optionC: "DNA replicates only half the time",
        optionD: "It happens in only half the cells",
        correctOption: "B",
        explanation: "Semi-conservative replication means each daughter DNA molecule retains one original (parent) strand and gains one newly synthesized strand.",
        difficulty: "MEDIUM",
        isFreeDemo: false,
      },
    ])} Medical Biology questions added`
  );

  // --- Medical: Chemistry ---
  console.log(
    `${await addQuestions(medChemistry.id, medicalCourse.id, [
      {
        question: "The pH of a neutral solution at 25°C is:",
        optionA: "0",
        optionB: "7",
        optionC: "14",
        optionD: "1",
        correctOption: "B",
        explanation: "A neutral solution has a pH of 7 at 25°C, meaning equal concentrations of H+ and OH- ions.",
        difficulty: "EASY",
        isFreeDemo: true,
      },
    ])} Medical Chemistry questions added`
  );

  console.log(`\nNew sectors seeded. ${total} new questions added.`);
  console.log("New courses: Loksewa Preparation, IOE Entrance Preparation, Medical Entrance Preparation.");
  console.log("These are now selectable in Company Web → Organizations → Edit Modules → Sector Access.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
