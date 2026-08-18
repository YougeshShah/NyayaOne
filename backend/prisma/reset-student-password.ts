import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/common/utils/password";

const prisma = new PrismaClient();

const TARGET_EMAIL = "parbin@gmail.com";
const NEW_PASSWORD = "StudentPass123!";

async function main() {
  const user = await prisma.user.findFirst({ where: { email: TARGET_EMAIL } });
  if (!user) {
    console.error(`No user found with email ${TARGET_EMAIL}`);
    process.exit(1);
  }

  const passwordHash = await hashPassword(NEW_PASSWORD);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  console.log(`Password reset successfully for ${TARGET_EMAIL}`);
  console.log(`New password: ${NEW_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
