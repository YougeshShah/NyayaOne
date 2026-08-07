-- AlterTable
ALTER TABLE "LibraryResource" ADD COLUMN     "hostLawFirmId" TEXT;

-- AddForeignKey
ALTER TABLE "LibraryResource" ADD CONSTRAINT "LibraryResource_hostLawFirmId_fkey" FOREIGN KEY ("hostLawFirmId") REFERENCES "LawFirm"("id") ON DELETE SET NULL ON UPDATE CASCADE;
