-- CreateEnum
CREATE TYPE "FlashcardFamiliarity" AS ENUM ('AGAIN', 'GOOD', 'EASY');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationAudience" ADD VALUE 'INSTITUTION_STUDENTS';
ALTER TYPE "NotificationAudience" ADD VALUE 'ALL_INSTITUTION_ADMINS';

-- CreateTable
CREATE TABLE "Flashcard" (
    "id" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "definition" TEXT NOT NULL,
    "example" TEXT,
    "courseId" TEXT NOT NULL,
    "subjectId" TEXT,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'MEDIUM',
    "hostLawFirmId" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Flashcard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlashcardProgress" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "flashcardId" TEXT NOT NULL,
    "familiarity" "FlashcardFamiliarity" NOT NULL,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FlashcardProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Flashcard_courseId_idx" ON "Flashcard"("courseId");

-- CreateIndex
CREATE INDEX "Flashcard_hostLawFirmId_idx" ON "Flashcard"("hostLawFirmId");

-- CreateIndex
CREATE INDEX "FlashcardProgress_studentId_idx" ON "FlashcardProgress"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "FlashcardProgress_studentId_flashcardId_key" ON "FlashcardProgress"("studentId", "flashcardId");

-- AddForeignKey
ALTER TABLE "Flashcard" ADD CONSTRAINT "Flashcard_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flashcard" ADD CONSTRAINT "Flashcard_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlashcardProgress" ADD CONSTRAINT "FlashcardProgress_flashcardId_fkey" FOREIGN KEY ("flashcardId") REFERENCES "Flashcard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
