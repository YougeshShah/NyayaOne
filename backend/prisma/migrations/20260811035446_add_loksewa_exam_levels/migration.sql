-- AlterTable
ALTER TABLE "LawFirm" ADD COLUMN     "allowedExamTypes" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "preferredExamType" TEXT;
