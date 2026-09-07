import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SOURCE_LINE = "\n\n---\nस्रोत: https://www.lawcommission.gov.np";

async function main() {
  const resources = await prisma.libraryResource.findMany({
    select: { id: true, title: true, content: true },
  });

  console.log(`Checking ${resources.length} resource(s)...\n`);

  let updated = 0;
  let alreadyHasSource = 0;
  let skippedNoContent = 0;

  for (const r of resources) {
    if (!r.content || !r.content.trim()) {
      skippedNoContent++;
      continue;
    }

    if (r.content.includes("lawcommission.gov.np")) {
      alreadyHasSource++;
      continue;
    }

    const newContent = r.content.trimEnd() + SOURCE_LINE;
    await prisma.libraryResource.update({ where: { id: r.id }, data: { content: newContent } });
    updated++;
  }

  console.log(`Done. ${updated} resource(s) got a source citation added.`);
  console.log(`${alreadyHasSource} already had one, ${skippedNoContent} had no content to attribute.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
