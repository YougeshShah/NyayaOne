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

  const passage5 = "Reading Passage: \"Kitchen middens, the accumulated waste heaps left behind by past communities, particularly shell, bone, and ash discarded near coastal and riverside settlements, have long been dismissed by casual observers as unremarkable rubbish tips, yet archaeologists increasingly regard them as among the richest sources of evidence available for reconstructing the diets, technologies, and even the climate experienced by the people who created them. Because these deposits accumulate gradually over long periods, often centuries, a single well-preserved midden can function almost like a layered archive, with older material buried beneath more recent deposits in a sequence that allows researchers to track changes over time within a single site, rather than having to compare separate sites of different ages and risk conflating genuine change with simple regional variation.\n\nOne particularly informative technique applied to midden shell material is oxygen isotope analysis, which exploits the fact that the ratio of different oxygen isotopes incorporated into a mollusc's shell as it grows varies with water temperature at the time of formation. Because many shellfish add growth layers on a roughly seasonal basis, in a manner broadly analogous to tree rings, researchers can sometimes determine not just the general time of year a particular shell was harvested, but track sea temperature fluctuations across multiple seasons or years within a single midden deposit, offering a genuinely local climate record for the specific period and location represented by that midden, one that is often more precise for that specific location than broader regional climate reconstructions can provide.\n\nMidden analysis has also complicated some long-standing assumptions about the economies of coastal communities in the past. Where earlier researchers often assumed that heavy reliance on shellfish indicated a relatively marginal subsistence strategy, adopted primarily during periods of scarcity when other food sources were unavailable, more detailed analysis of midden composition at numerous sites has instead suggested that shellfish gathering was frequently a deliberate, sustained, and in some cases highly organised economic activity in its own right, sometimes persisting for centuries even in the presence of arguably more calorie-efficient alternatives such as large-game hunting, implying that dietary choices were shaped by factors considerably more complex than pure caloric efficiency, potentially including labour organisation, reliability of the food source across seasons, and social or cultural preference.\n\nDespite their value, middens face significant threats. Coastal erosion, accelerated in many regions by rising sea levels, is actively destroying midden sites at a pace that has alarmed archaeologists working in vulnerable coastal zones, while some inland middens have historically been mined for their shell content, used as an agricultural soil amendment or a construction material, without the archaeological documentation that would have preserved the layered record before it was dispersed. Some archaeologists have argued for prioritising the excavation and recording of at-risk coastal middens specifically, even ahead of comparably significant inland sites facing less immediate threat, on the pragmatic grounds that inland sites, while equally valuable in principle, are likely to remain available for future study using improved techniques not yet available today, whereas an eroded coastal midden represents a permanently lost record that cannot be recovered by any future advance in methodology.\"";

  console.log("Seeding Passage 5 (Kitchen Middens as Archaeological Archives)...");

  await addQuestion({
    question: passage5 + "\n\nA single midden can show changes over time because older material lies beneath newer material.",
    answerType: "TRUE_FALSE_NOT_GIVEN",
    optionA: "True",
    optionB: "False",
    optionC: "Not Given",
    correctOption: "A",
    explanation: "The passage states older material is 'buried beneath more recent deposits in a sequence that allows researchers to track changes over time within a single site'.",
    difficulty: "EASY",
    isFreeDemo: true,
  });

  await addQuestion({
    question: passage5 + "\n\nOxygen isotope analysis can only reveal the general season a shell was harvested, not track temperature changes over time.",
    answerType: "TRUE_FALSE_NOT_GIVEN",
    optionA: "True",
    optionB: "False",
    optionC: "Not Given",
    correctOption: "B",
    explanation: "The passage says researchers can 'track sea temperature fluctuations across multiple seasons or years' -- directly contradicting the claim that it only reveals general season.",
    difficulty: "MEDIUM",
    isFreeDemo: false,
  });

  await addQuestion({
    question: passage5 + "\n\nAll archaeologists now agree that inland middens should never be excavated.",
    answerType: "TRUE_FALSE_NOT_GIVEN",
    optionA: "True",
    optionB: "False",
    optionC: "Not Given",
    correctOption: "C",
    explanation: "The passage discusses prioritising coastal sites over inland ones due to urgency, but does not state that inland middens should NEVER be excavated -- this specific claim is not made.",
    difficulty: "HARD",
    isFreeDemo: false,
  });

  await addQuestion({
    question: passage5 + "\n\nWhat did more detailed midden analysis reveal about shellfish gathering?",
    answerType: "MCQ",
    optionA: "It was always a sign of food scarcity",
    optionB: "It was often a deliberate, sustained economic activity",
    optionC: "It stopped once large-game hunting became available",
    optionD: "It was only practiced by isolated communities",
    correctOption: "B",
    explanation: "The passage states analysis suggested shellfish gathering was 'frequently a deliberate, sustained, and in some cases highly organised economic activity in its own right'.",
    difficulty: "MEDIUM",
    isFreeDemo: false,
  });

  await addQuestion({
    question: passage5 + "\n\nWhy do some archaeologists prioritise excavating coastal middens over inland ones?",
    answerType: "MCQ",
    optionA: "Coastal middens are always older",
    optionB: "Inland middens contain less useful information",
    optionC: "Coastal erosion could destroy the record permanently",
    optionD: "Coastal sites are easier to access",
    correctOption: "C",
    explanation: "The passage explains an eroded coastal midden 'represents a permanently lost record that cannot be recovered', unlike inland sites which 'are likely to remain available for future study'.",
    difficulty: "MEDIUM",
    isFreeDemo: false,
  });

  await addQuestion({
    question: passage5 + "\n\nComplete the summary below. Choose ONE WORD ONLY from the passage for each answer.\n\nMiddens are layered deposits of shell, bone, and {{1}} that reveal past diets and climate. Oxygen {{2}} analysis of shell growth layers can reveal local sea temperature over time. Detailed analysis suggests shellfish gathering was often a deliberate {{3}} activity rather than a sign of scarcity. Coastal middens are threatened by {{4}}, making their excavation urgent.",
    answerType: "MULTI_BLANK",
    correctAnswerText: "ash|isotope|economic|erosion",
    explanation: "Traced to: shell, bone, and ash (para 1), oxygen isotope analysis (para 2), economic activity in its own right (para 3), and coastal erosion (para 4).",
    difficulty: "HARD",
    isFreeDemo: false,
  });

  console.log("\nDone. " + created + " new Reading question(s) added (Passage 5).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
