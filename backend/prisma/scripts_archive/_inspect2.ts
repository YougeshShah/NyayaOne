import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const t = await prisma.documentTemplate.findFirst({ where: { title: { contains: "फैसलाबमोजिम कसुरदार पक्राउ" } } });
  if (!t) return console.log("not found");
  const idx = t.bodyTemplate!.indexOf("{{field_11}}");
  console.log(JSON.stringify(t.bodyTemplate!.slice(idx, idx+80)));
}
main().finally(() => prisma.$disconnect());
