-- AlterTable
ALTER TABLE "LiveClass" ADD COLUMN     "hostLawFirmId" TEXT;

-- AddForeignKey
ALTER TABLE "LiveClass" ADD CONSTRAINT "LiveClass_hostLawFirmId_fkey" FOREIGN KEY ("hostLawFirmId") REFERENCES "LawFirm"("id") ON DELETE SET NULL ON UPDATE CASCADE;
