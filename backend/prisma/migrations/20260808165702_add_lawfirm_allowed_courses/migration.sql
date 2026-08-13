-- AlterTable
ALTER TABLE "LawFirm" ADD COLUMN     "allowedCourseIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
