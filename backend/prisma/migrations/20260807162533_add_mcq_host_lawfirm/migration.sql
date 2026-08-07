-- AlterTable
ALTER TABLE "McqQuestion" ADD COLUMN     "hostLawFirmId" TEXT;

-- AddForeignKey
ALTER TABLE "McqQuestion" ADD CONSTRAINT "McqQuestion_hostLawFirmId_fkey" FOREIGN KEY ("hostLawFirmId") REFERENCES "LawFirm"("id") ON DELETE SET NULL ON UPDATE CASCADE;
