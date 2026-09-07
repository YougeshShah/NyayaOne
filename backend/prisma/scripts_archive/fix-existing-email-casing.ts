import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// One-time fix: normalizes every existing User.email and LawFirm.email to
// lowercase. Needed because accounts created before the case-insensitive
// login fix may have mixed-case emails (e.g. "Raju@gmail.com") that no
// longer match what people naturally type when logging in.

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, email: true } });
  let usersFixed = 0;
  for (const u of users) {
    const lower = u.email.toLowerCase().trim();
    if (lower !== u.email) {
      const clash = await prisma.user.findFirst({ where: { email: lower, NOT: { id: u.id } } });
      if (clash) {
        console.warn(`Skipped ${u.email} -> ${lower}: another account already uses that email.`);
        continue;
      }
      await prisma.user.update({ where: { id: u.id }, data: { email: lower } });
      usersFixed++;
    }
  }
  console.log(`Fixed ${usersFixed} user email(s).`);

  const firms = await prisma.lawFirm.findMany({ select: { id: true, email: true } });
  let firmsFixed = 0;
  for (const f of firms) {
    if (!f.email) continue;
    const lower = f.email.toLowerCase().trim();
    if (lower !== f.email) {
      await prisma.lawFirm.update({ where: { id: f.id }, data: { email: lower } });
      firmsFixed++;
    }
  }
  console.log(`Fixed ${firmsFixed} organization email(s).`);

  console.log("\nDone. Try logging in with lowercase emails now.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
