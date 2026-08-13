import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Replaces the single generic "Speaking" section with the real IELTS
// 3-part structure: Part 1 (introduction/familiar topics), Part 2
// (individual long turn / cue card), Part 3 (two-way discussion connected
// to Part 2's topic).

async function main() {
  const mockTest = await prisma.mockTest.findFirst({ where: { title: "IELTS Full Practice Test 1" } });
  if (!mockTest) {
    console.error("IELTS Full Practice Test 1 not found -- run seed-original-content-5.ts first.");
    process.exit(1);
  }

  // Remove the old single generic Speaking section, if present, so we don't
  // end up with both the old and new structure at once.
  const oldSpeaking = await prisma.testSection.findFirst({ where: { mockTestId: mockTest.id, type: "SPEAKING", title: "Speaking" } });
  if (oldSpeaking) {
    await prisma.testSection.delete({ where: { id: oldSpeaking.id } });
    console.log("Removed old generic Speaking section.");
  }

  const part1Exists = await prisma.testSection.findFirst({ where: { mockTestId: mockTest.id, title: "Speaking Part 1" } });
  if (!part1Exists) {
    await prisma.testSection.create({
      data: {
        mockTestId: mockTest.id,
        type: "SPEAKING",
        title: "Speaking Part 1",
        writingPrompt:
          "Introduction and interview (4-5 minutes). The examiner asks general questions on familiar topics -- for example: your home town, your studies or work, your hobbies, or your daily routine. " +
          "Practice questions: What do you do -- do you work or are you a student? What do you enjoy doing in your free time? Do you prefer spending time indoors or outdoors? Why? " +
          "Speaking is practiced live -- check the course page for scheduled Speaking practice sessions.",
        timeLimitMinutes: 5,
        order: 5,
      },
    });
    console.log("Created Speaking Part 1 section");
  }

  const part2Exists = await prisma.testSection.findFirst({ where: { mockTestId: mockTest.id, title: "Speaking Part 2" } });
  if (!part2Exists) {
    await prisma.testSection.create({
      data: {
        mockTestId: mockTest.id,
        type: "SPEAKING",
        title: "Speaking Part 2",
        writingPrompt:
          "Individual long turn / cue card (3-4 minutes: 1 minute to prepare, then speak for 1-2 minutes). " +
          "Topic card: Describe a place you visited that you found interesting. You should say: where it was, when you went there, what you did there, and explain why you found it interesting. " +
          "Speaking is practiced live -- check the course page for scheduled Speaking practice sessions.",
        timeLimitMinutes: 4,
        order: 6,
      },
    });
    console.log("Created Speaking Part 2 section");
  }

  const part3Exists = await prisma.testSection.findFirst({ where: { mockTestId: mockTest.id, title: "Speaking Part 3" } });
  if (!part3Exists) {
    await prisma.testSection.create({
      data: {
        mockTestId: mockTest.id,
        type: "SPEAKING",
        title: "Speaking Part 3",
        writingPrompt:
          "Two-way discussion connected to the Part 2 topic (4-5 minutes), exploring more abstract ideas and issues. " +
          "Practice questions: Why do people enjoy visiting new places? How has tourism changed in your country over the last twenty years? Do you think travel changes a person's outlook on life? Why or why not? " +
          "Speaking is practiced live -- check the course page for scheduled Speaking practice sessions.",
        timeLimitMinutes: 5,
        order: 7,
      },
    });
    console.log("Created Speaking Part 3 section");
  }

  console.log("\nDone. Speaking now has the real 3-part IELTS structure (Part 1, 2, 3).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
