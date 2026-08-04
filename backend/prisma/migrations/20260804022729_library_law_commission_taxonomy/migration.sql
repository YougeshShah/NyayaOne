-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "LibraryResourceType" ADD VALUE 'ORDINANCE';
ALTER TYPE "LibraryResourceType" ADD VALUE 'FORMATION_ORDER';
ALTER TYPE "LibraryResourceType" ADD VALUE 'POLICY';
ALTER TYPE "LibraryResourceType" ADD VALUE 'INTERNATIONAL_TREATY';
ALTER TYPE "LibraryResourceType" ADD VALUE 'HISTORICAL_DOCUMENT';
ALTER TYPE "LibraryResourceType" ADD VALUE 'ANNUAL_REPORT';
ALTER TYPE "LibraryResourceType" ADD VALUE 'RTI_DISCLOSURE';

-- AlterTable
ALTER TABLE "LibraryResource" ADD COLUMN     "isRepealed" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "LibraryResource_isRepealed_idx" ON "LibraryResource"("isRepealed");
