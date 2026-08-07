/*
  Warnings:

  - A unique constraint covering the columns `[name,lawFirmId]` on the table `Role` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Role_name_key";

-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "lawFirmId" TEXT;

-- CreateIndex
CREATE INDEX "Role_lawFirmId_idx" ON "Role"("lawFirmId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_lawFirmId_key" ON "Role"("name", "lawFirmId");

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm"("id") ON DELETE CASCADE ON UPDATE CASCADE;
