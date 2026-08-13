import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Run this AFTER copying the .mp3 files into:
//   backend/uploads/audio/
// (the same folder the "Upload Audio Clip" button writes to).
//
// Matches each audio file to its question by a short snippet of that
// question's known opening text, then sets audioUrl directly -- no need
// to click through Edit -> Upload Audio Clip in the UI for each one.

const AUDIO_MAP: { filename: string; questionStartsWith: string }[] = [
  { filename: "listening-1-community-centre.mp3", questionStartsWith: "Listening Transcript: \"Good morning, Riverside" },
  { filename: "listening-2-urban-heat-islands.mp3", questionStartsWith: "Listening Transcript: \"Tutor: So, you two" },
  { filename: "listening-3-museum-tour.mp3", questionStartsWith: "Listening Transcript: \"Good afternoon everyone, and welcome to the City History" },
  { filename: "listening-4-fifteen-minute-city.mp3", questionStartsWith: "Listening Transcript: \"Today I want to talk about a topic in urban planning" },
];

async function main() {
  let linked = 0;
  let skipped = 0;

  for (const item of AUDIO_MAP) {
    const audioUrl = `/uploads/audio/${item.filename}`;
    const matches = await prisma.mcqQuestion.findMany({
      where: { question: { startsWith: item.questionStartsWith } },
    });

    if (matches.length === 0) {
      console.log(`No questions found starting with: "${item.questionStartsWith.slice(0, 50)}..." -- skipped.`);
      skipped++;
      continue;
    }

    for (const q of matches) {
      await prisma.mcqQuestion.update({ where: { id: q.id }, data: { audioUrl } });
    }
    console.log(`Linked ${item.filename} to ${matches.length} question(s).`);
    linked += matches.length;
  }

  console.log(`\nDone. ${linked} question(s) linked to audio, ${skipped} audio file(s) had no matching question.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
