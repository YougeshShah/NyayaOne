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

  const transcript4 = "Listening Transcript: \"Today I want to talk about a topic in urban planning called the fifteen-minute city, an idea that's gained a lot of attention among city planners over the past few years. The basic concept is straightforward: a fifteen-minute city is one designed so that residents can reach most of their daily needs, that's things like grocery shopping, healthcare, education, and workplaces, within a fifteen-minute walk or bicycle ride from their home, rather than needing to rely on a car or lengthy public transport journey. The idea itself isn't entirely new; it draws heavily on much older concepts of neighbourhood planning from the early twentieth century, but it's been given fresh momentum recently, partly due to growing concern about transport emissions, and partly due to changing work patterns following the pandemic, which meant many people were suddenly spending far more time in their immediate neighbourhood than they had before. Several cities have now adopted the fifteen-minute city as an explicit policy goal, with the most frequently cited example being a major implementation that began in the early twenty-twenties. Now, it's worth noting that implementing this in practice has proven considerably harder than the concept suggests. One significant obstacle is that many existing suburbs were built specifically around car use, with housing, shops, and workplaces deliberately separated by zoning regulations, meaning that achieving a fifteen-minute city in these areas would require not just adding new amenities, but genuinely rezoning entire neighbourhoods, a politically difficult and slow process. A second challenge relates to equity: critics have pointed out that if the concept is implemented unevenly, wealthier neighbourhoods might gain new amenities and better walkability while poorer areas are left further behind, potentially widening existing inequalities rather than reducing them. There's also been some public pushback in a few cities, with a small but vocal group of residents raising concerns, sometimes based on misunderstanding, that the policy is about restricting movement rather than about improving local amenities, which has made public communication a genuine and ongoing challenge for planners trying to build support for these schemes.\"";

  console.log("Seeding Listening Section 4 (The Fifteen-Minute City Lecture)...");

  await addQuestion({
    question: transcript4 + "\n\nComplete the notes below. Write NO MORE THAN TWO WORDS for each answer.\n\nFifteen-minute city: residents reach daily needs within a 15-minute {{1}} or bicycle ride.\nConcept draws on older ideas about {{2}} planning from the early 20th century.\nRecent momentum partly due to concern about transport {{3}} and changing work patterns.\nChallenge 1: many suburbs were built around {{4}} use, with zoning separating housing from shops.",
    answerType: "MULTI_BLANK",
    correctAnswerText: "walk|neighbourhood|emissions|car",
    explanation: "All four answers are stated directly by the lecturer in the talk.",
    difficulty: "HARD",
    isFreeDemo: true,
  });

  await addQuestion({
    question: transcript4 + "\n\nWhat equity concern do critics raise about the fifteen-minute city?",
    answerType: "MCQ",
    optionA: "It would make housing more expensive everywhere",
    optionB: "Wealthier areas might benefit more, widening inequality",
    optionC: "It would eliminate all car ownership",
    optionD: "It only works in cities with good weather",
    correctOption: "B",
    explanation: "The lecturer explains critics worry wealthier neighbourhoods might gain new amenities while poorer areas are left further behind, potentially widening existing inequalities.",
    difficulty: "MEDIUM",
    isFreeDemo: false,
  });

  await addQuestion({
    question: transcript4 + "\n\nAccording to the lecturer, what misunderstanding has fuelled public pushback in some cities?",
    answerType: "SHORT_ANSWER",
    correctAnswerText: "that it restricts movement",
    explanation: "The lecturer says some residents believe, based on misunderstanding, that the policy is about restricting movement rather than about improving local amenities.",
    difficulty: "MEDIUM",
    isFreeDemo: false,
  });

  console.log("\nDone. " + created + " new Listening question(s) added (Section 4 - Fifteen-Minute City).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
