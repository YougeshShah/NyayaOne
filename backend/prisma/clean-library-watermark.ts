import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Strips the "www.lawcommission.gov.np" watermark that got embedded
// repeatedly throughout the extracted PDF text (it appears once per PDF
// page as a header, so a multi-page Act ends up with it dozens of times
// scattered through the content).

async function main() {
  const resources = await prisma.libraryResource.findMany({
    where: { content: { contains: "lawcommission.gov.np" } },
    select: { id: true, title: true, content: true },
  });

  console.log(`Found ${resources.length} resource(s) with the watermark noise.`);

  let cleaned = 0;
  for (const r of resources) {
    if (!r.content) continue;
    const before = r.content;
    const after = before
      .replace(/www\.lawcommission\.gov\.np/g, "")
      // Also collapse the run of blank lines/page-number digits that
      // typically surrounds each watermark occurrence (e.g. a lone "1",
      // "2" page number left behind on its own line after the URL is gone).
      .replace(/\n[ \t]*\d{1,3}[ \t]*\n(?=\s*\n)/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (after !== before) {
      await prisma.libraryResource.update({ where: { id: r.id }, data: { content: after } });
      cleaned++;
      console.log(`  Cleaned: ${r.title}`);
    }
  }

  console.log(`\nDone. ${cleaned} resource(s) cleaned.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
