import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findFirst({ where: { accountType: "COMPANY" } });
  if (!admin) {
    console.error("No COMPANY user found -- run the main seed script first.");
    process.exit(1);
  }

  const ieltsCourse = await prisma.course.findFirst({ where: { name: "IELTS Preparation" } });
  if (!ieltsCourse) {
    console.error("IELTS Preparation course not found.");
    process.exit(1);
  }

  const listeningSubject = await prisma.subject.findFirst({ where: { name: "Listening", courseId: ieltsCourse.id } });
  if (!listeningSubject) {
    console.error("Listening subject not found.");
    process.exit(1);
  }

  let created = 0;
  async function addQuestion(data: any) {
    const existing = await prisma.mcqQuestion.findFirst({ where: { question: { startsWith: data.question.slice(0, 60) } } });
    if (!existing) {
      await prisma.mcqQuestion.create({
        data: { ...data, subjectId: listeningSubject!.id, courseId: ieltsCourse!.id, createdBy: admin!.id, sectionType: "LISTENING" },
      });
      created++;
    }
  }

  const transcript3 = "Listening Transcript: \"Good afternoon everyone, and welcome to the City History Museum. Before we begin the guided tour, let me give you a quick overview of what's on offer today. We're currently standing in the Main Hall, and from here the museum is divided into four permanent galleries. The Roman Gallery is straight ahead of you, and it's currently our most popular exhibit, largely thanks to the newly restored mosaic floor that was uncovered during roadworks just two streets from here. To your left is the Medieval Gallery, which I'd particularly recommend if you're interested in the city's trading history -- it has an excellent scale model of the old harbour. Upstairs, you'll find the Victorian Gallery, which focuses on the industrial period, and next to that is our newest addition, the Modern City Gallery, which only opened last spring and covers the last hundred years of urban development. Now, a few practical notes. The cafe is located on the ground floor near the entrance, and it stays open until half an hour after the museum itself closes. If you'd like to visit the gift shop, that's also on the ground floor, just past the cafe. Today's guided tour will focus mainly on the Roman and Medieval galleries, and should take about fifty minutes. If you'd prefer to explore independently afterward, audio guides are available at the information desk for a small additional charge. One last thing -- photography is permitted throughout the museum, but please turn off your flash in the Medieval Gallery specifically, as the textiles on display there are especially sensitive to light damage. Right, if everyone's ready, let's make our way toward the Roman Gallery to begin.\"";

  console.log("Seeding Listening Section 2 (Museum Guided Tour)...");

  await addQuestion({
    question: transcript3 + "\n\nComplete the notes below. Write NO MORE THAN TWO WORDS for each answer.\n\nMain Hall leads to four galleries:\n- Roman Gallery: popular due to a restored {{1}}\n- Medieval Gallery: has a scale model of the old {{2}}\n- Victorian Gallery: focuses on the {{3}} period\n- Modern City Gallery: newest, opened last {{4}}",
    answerType: "MULTI_BLANK",
    correctAnswerText: "mosaic floor|harbour|industrial|spring",
    explanation: "All four answers come directly from the speaker's description of each gallery.",
    difficulty: "MEDIUM",
    isFreeDemo: true,
  });

  await addQuestion({
    question: transcript3 + "\n\nWhere is the gift shop located?",
    answerType: "MCQ",
    optionA: "Upstairs, next to the Victorian Gallery",
    optionB: "On the ground floor, past the cafe",
    optionC: "Inside the Roman Gallery",
    optionD: "Next to the information desk",
    correctOption: "B",
    explanation: "The speaker says the gift shop is also on the ground floor, just past the cafe.",
    difficulty: "EASY",
    isFreeDemo: false,
  });

  await addQuestion({
    question: transcript3 + "\n\nWhy should visitors turn off flash photography specifically in the Medieval Gallery?",
    answerType: "SHORT_ANSWER",
    correctAnswerText: "the textiles are sensitive to light",
    explanation: "The speaker explains the textiles on display there are especially sensitive to light damage.",
    difficulty: "MEDIUM",
    isFreeDemo: false,
  });

  await addQuestion({
    question: transcript3 + "\n\nHow long is today's guided tour expected to take?",
    answerType: "MCQ",
    optionA: "About twenty minutes",
    optionB: "About fifty minutes",
    optionC: "About ninety minutes",
    optionD: "The full day",
    correctOption: "B",
    explanation: "The speaker states the tour should take about fifty minutes.",
    difficulty: "EASY",
    isFreeDemo: false,
  });

  console.log("\nDone. " + created + " new Listening question(s) added (Section 2 - Museum Tour).");
  console.log("\nReminder: upload real audio for this transcript via Upload Audio Clip before use.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
