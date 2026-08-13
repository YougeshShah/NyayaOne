import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ORIGINAL content, continuing the same real-IELTS-pattern approach as
// seed-ielts-reading-v2.ts: one passage produces a MIX of question types.

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

  const passage3 = "Reading Passage: \"The idea that handwriting is a dying skill, gradually rendered obsolete by keyboards and touchscreens, has become a familiar refrain over the past two decades. Yet a body of research emerging from cognitive science has complicated this narrative considerably, suggesting that the physical act of writing by hand may play a distinct and difficult-to-replace role in learning, one that typing does not straightforwardly replicate. Several studies comparing note-taking by hand against note-taking on a laptop have found that, although typing allows students to capture more words verbatim, students who wrote notes by hand performed better on conceptual questions asked afterward, suggesting that the slower pace of handwriting forces a kind of real-time summarising and processing that verbatim typing bypasses.\n\nThe explanation most commonly offered rests on the distinction between what researchers term generative and non-generative note-taking. Because typing is fast enough to allow near-verbatim transcription of a lecture, it can become a largely passive activity, with the note-taker essentially transcribing rather than actively engaging with the material's structure and meaning. Handwriting's relative slowness, by contrast, all but forces the note-taker to be selective, deciding in real time which points matter enough to record, and to paraphrase rather than copy directly, a process understood to deepen encoding of the material into memory. Some researchers caution, however, that this advantage may be specific to the particular kind of test used in most of these studies, and may not generalise as clearly to tasks such as long-term retention over months rather than days, an area where the evidence remains considerably thinner.\n\nA separate strand of research has focused specifically on children learning to read and write for the first time, finding that the fine motor movements involved in forming letters by hand appear to help build the neural pathways associated with letter recognition in a way that typing on a keyboard, which involves a much smaller and less varied set of motor movements, does not replicate to the same degree. This has led some early-years educators to argue for retaining substantial handwriting instruction in the early curriculum even as digital literacy is introduced earlier and earlier, on the grounds that the two skills may serve genuinely different cognitive functions rather than one simply superseding the other as a more efficient substitute.\n\nNone of this research argues for abandoning keyboards, and few researchers in the field would claim that typing offers no advantages, particularly for longer-form writing where the ability to revise and reorganise text easily is itself valuable for the writing process. The more measured conclusion drawn by most researchers working in this area is that handwriting and typing may be better understood as complementary tools suited to different purposes and different stages of learning, rather than as a simple binary of an outdated skill and its modern replacement, and that curricula which drop handwriting instruction entirely on efficiency grounds may be discarding a genuine cognitive benefit rather than an obsolete formality.\"";

  console.log("Seeding Passage 3 (The Cognitive Case for Handwriting)...");

  await addQuestion({
    question: passage3 + "\n\nStudents who typed their notes captured more words verbatim than those who wrote by hand.",
    answerType: "TRUE_FALSE_NOT_GIVEN",
    optionA: "True",
    optionB: "False",
    optionC: "Not Given",
    correctOption: "A",
    explanation: "The passage states typing allows students to capture more words verbatim compared to handwriting.",
    difficulty: "EASY",
    isFreeDemo: true,
  });

  await addQuestion({
    question: passage3 + "\n\nThe advantage of handwriting has been proven to extend to long-term retention over several months.",
    answerType: "TRUE_FALSE_NOT_GIVEN",
    optionA: "True",
    optionB: "False",
    optionC: "Not Given",
    correctOption: "B",
    explanation: "The passage explicitly says evidence for long-term retention remains considerably thinner, meaning this has NOT been proven, making the statement False rather than Not Given.",
    difficulty: "HARD",
    isFreeDemo: false,
  });

  await addQuestion({
    question: passage3 + "\n\nAll researchers in the field agree that typing offers no advantages over handwriting.",
    answerType: "TRUE_FALSE_NOT_GIVEN",
    optionA: "True",
    optionB: "False",
    optionC: "Not Given",
    correctOption: "B",
    explanation: "The passage states few researchers would claim that typing offers no advantages, directly contradicting this statement.",
    difficulty: "MEDIUM",
    isFreeDemo: false,
  });

  await addQuestion({
    question: passage3 + "\n\nWhat does 'generative' note-taking involve, according to the passage?",
    answerType: "MCQ",
    optionA: "Copying text word-for-word as quickly as possible",
    optionB: "Selecting and paraphrasing key points in real time",
    optionC: "Using pre-printed templates to organise notes",
    optionD: "Recording lectures for later transcription",
    correctOption: "B",
    explanation: "The passage describes handwriting forcing note-takers to be selective and to paraphrase rather than copy directly.",
    difficulty: "MEDIUM",
    isFreeDemo: false,
  });

  await addQuestion({
    question: passage3 + "\n\nWhy might handwriting be particularly important for children learning to read and write?",
    answerType: "MCQ",
    optionA: "It is faster than typing for young children",
    optionB: "It requires less parental supervision",
    optionC: "Fine motor movements help build letter-recognition pathways",
    optionD: "It is the only method allowed in most schools",
    correctOption: "C",
    explanation: "The passage states the fine motor movements of handwriting appear to help build the neural pathways associated with letter recognition.",
    difficulty: "MEDIUM",
    isFreeDemo: false,
  });

  await addQuestion({
    question: passage3 + "\n\nComplete the summary below. Choose ONE WORD ONLY from the passage for each answer.\n\nResearch suggests handwriting's slower pace forces {{1}} note-taking, where writers must decide what matters and {{2}} it rather than copy word for word. This appears to help students answer {{3}} questions better afterward. For young children, handwriting may also help build neural {{4}} linked to letter recognition.",
    answerType: "MULTI_BLANK",
    correctAnswerText: "generative|paraphrase|conceptual|pathways",
    explanation: "Traced to: generative and non-generative note-taking (para 2), paraphrase rather than copy directly (para 2), better on conceptual questions (para 1), and neural pathways associated with letter recognition (para 3).",
    difficulty: "HARD",
    isFreeDemo: false,
  });

  console.log("\nDone. " + created + " new Reading question(s) added (Passage 3).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
