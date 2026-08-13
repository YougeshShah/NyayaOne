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

  const readingSubject = await prisma.subject.findFirst({ where: { name: "Reading", courseId: ieltsCourse.id } });
  if (!readingSubject) {
    console.error("Reading subject not found.");
    process.exit(1);
  }

  let created = 0;
  async function addQuestion(data: any) {
    const existing = await prisma.mcqQuestion.findFirst({ where: { question: { startsWith: data.question.slice(0, 60) } } });
    if (!existing) {
      await prisma.mcqQuestion.create({ data: { ...data, subjectId: readingSubject!.id, courseId: ieltsCourse!.id, createdBy: admin!.id } });
      created++;
    }
  }

  const passage4 = "Reading Passage: \"For much of the twentieth century, the dominant model of animal cognition held that non-human animals operated largely on instinct and simple conditioning, with genuine planning for the future considered a distinctly human capacity requiring language and abstract reasoning that other species were presumed to lack. This assumption has been substantially challenged over the past two decades by a series of studies on corvids, the family of birds that includes crows, ravens, and jays, several species of which have demonstrated behaviour difficult to explain without attributing to them some capacity to anticipate future needs rather than simply react to present circumstances.\n\nThe most widely cited evidence comes from studies of food caching behaviour in western scrub jays. These birds routinely hide food in numerous locations for later retrieval, a behaviour that alone might be explained by instinct rather than planning. What proved more striking was a series of experiments demonstrating that the jays adjust their caching behaviour based on anticipated future states: birds that had previously experienced a period of food scarcity in a particular location began caching disproportionately more food for that location in subsequent opportunities, even when food was currently abundant, suggesting they were planning for a future condition that did not yet exist rather than simply responding to their present state of hunger or satiation.\n\nA further, particularly compelling study found that scrub jays would selectively re-cache food they had hidden while being watched by another bird, moving it to a new, unobserved location once the observing bird had left, but critically, only if the caching bird had itself previously stolen another bird's cached food. Jays without this thieving experience did not show the same re-caching behaviour, leading researchers to suggest that the behaviour depends on the bird's own experience of being a thief, which appears to inform an understanding that its own caches are similarly vulnerable to theft by others, a form of reasoning about another's likely future behaviour based on inference from one's own past behaviour.\n\nSkeptics of these interpretations have raised a recurring methodological concern: that researchers may be too quick to attribute complex mental states to animals when simpler explanations, involving associative learning built up over many trials rather than genuine forward planning, might account for the same behaviour without requiring the animal to represent a future state that does not yet exist. Proponents of the planning interpretation counter that the specificity of the re-caching behaviour, its dependence on the bird's own thieving history rather than simply on having watched another bird be robbed, is difficult to explain through simple associative learning alone, since the relevant association, between having stolen and adjusting one's own caching behaviour, is a fairly abstract inference rather than a direct behavioural pairing of the kind associative learning theories typically invoke. The debate remains unresolved, and has prompted broader discussion in the field about what standard of evidence should be required before more complex cognitive processes are attributed to non-human species, a question with implications well beyond corvid research alone.\"";

  console.log("Seeding Passage 4 (The Planning Minds of Corvids)...");

  await addQuestion({
    question: passage4 + "\n\nFor most of the twentieth century, planning for the future was widely believed to require language.",
    answerType: "TRUE_FALSE_NOT_GIVEN",
    optionA: "True",
    optionB: "False",
    optionC: "Not Given",
    correctOption: "A",
    explanation: "The passage states genuine planning was 'considered a distinctly human capacity requiring language and abstract reasoning'.",
    difficulty: "MEDIUM",
    isFreeDemo: true,
  });

  await addQuestion({
    question: passage4 + "\n\nJays that had never experienced food scarcity still increased caching for locations linked to scarcity.",
    answerType: "TRUE_FALSE_NOT_GIVEN",
    optionA: "True",
    optionB: "False",
    optionC: "Not Given",
    correctOption: "B",
    explanation: "The passage specifies it was 'birds that had previously experienced a period of food scarcity' who increased caching -- jays without that experience are not described as behaving this way.",
    difficulty: "HARD",
    isFreeDemo: false,
  });

  await addQuestion({
    question: passage4 + "\n\nAll scrub jays re-cache their food after being watched by another bird.",
    answerType: "TRUE_FALSE_NOT_GIVEN",
    optionA: "True",
    optionB: "False",
    optionC: "Not Given",
    correctOption: "B",
    explanation: "The passage says re-caching happened 'only if the caching bird had itself previously stolen another bird's cached food' -- jays without thieving experience did not show this behaviour, so not ALL jays do this.",
    difficulty: "MEDIUM",
    isFreeDemo: false,
  });

  await addQuestion({
    question: passage4 + "\n\nWhat did researchers conclude was necessary for a jay to re-cache food after being watched?",
    answerType: "MCQ",
    optionA: "Being watched by more than one bird",
    optionB: "Having previously stolen food from another bird itself",
    optionC: "Being hungry at the time of caching",
    optionD: "Having cached food in that location before",
    correctOption: "B",
    explanation: "The passage states the behaviour 'depends on the bird's own experience of being a thief'.",
    difficulty: "MEDIUM",
    isFreeDemo: false,
  });

  await addQuestion({
    question: passage4 + "\n\nWhat is the main methodological concern raised by skeptics?",
    answerType: "MCQ",
    optionA: "The sample sizes in the studies were too small",
    optionB: "Simpler associative learning might explain the same behaviour",
    optionC: "The jays used in the studies were not wild-caught",
    optionD: "The researchers did not control for the time of day",
    correctOption: "B",
    explanation: "Skeptics argue 'simpler explanations, involving associative learning...might account for the same behaviour without requiring the animal to represent a future state'.",
    difficulty: "MEDIUM",
    isFreeDemo: false,
  });

  await addQuestion({
    question: passage4 + "\n\nComplete the summary below. Choose ONE WORD ONLY from the passage for each answer.\n\nStudies of {{1}} jays challenged the view that only humans can plan ahead. Jays increased food caching for locations linked to past {{2}}, even when food was currently plentiful. They also re-cached food after being watched, but only if they had previously been a {{3}} themselves. Skeptics argue this could still be explained by {{4}} learning rather than true planning.",
    answerType: "MULTI_BLANK",
    correctAnswerText: "scrub|scarcity|thief|associative",
    explanation: "Traced to: western scrub jays (para 2), period of food scarcity (para 2), the bird's own experience of being a thief (para 3), and associative learning (para 4).",
    difficulty: "HARD",
    isFreeDemo: false,
  });

  console.log("\nDone. " + created + " new Reading question(s) added (Passage 4).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
