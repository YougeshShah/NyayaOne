-- Speaking module tables only -- deliberately excludes any ALTER on
-- Precedent.searchVector (that's a generated column Prisma's diff engine
-- doesn't fully understand, unrelated to this feature, and touching it
-- risks the same error seen with `prisma db push` earlier).

CREATE TYPE "SpeakingSubmissionStatus" AS ENUM ('PENDING_GRADING', 'GRADED', 'GRADING_FAILED');

CREATE TABLE "SpeakingPrompt" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "part" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "promptText" TEXT NOT NULL,
    "prepTimeSeconds" INTEGER,
    "speakTimeSeconds" INTEGER NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SpeakingPrompt_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SpeakingSubmission" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "recordingUrl" TEXT NOT NULL,
    "recordingType" TEXT NOT NULL,
    "durationSeconds" INTEGER,
    "status" "SpeakingSubmissionStatus" NOT NULL DEFAULT 'PENDING_GRADING',
    "transcript" TEXT,
    "fluencyScore" DOUBLE PRECISION,
    "lexicalScore" DOUBLE PRECISION,
    "grammarScore" DOUBLE PRECISION,
    "pronunciationScore" DOUBLE PRECISION,
    "overallBand" DOUBLE PRECISION,
    "aiFeedback" TEXT,
    "gradedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SpeakingSubmission_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SpeakingPrompt_courseId_idx" ON "SpeakingPrompt"("courseId");
CREATE INDEX "SpeakingSubmission_studentId_idx" ON "SpeakingSubmission"("studentId");
CREATE INDEX "SpeakingSubmission_promptId_idx" ON "SpeakingSubmission"("promptId");
CREATE INDEX "SpeakingSubmission_status_idx" ON "SpeakingSubmission"("status");

ALTER TABLE "SpeakingPrompt" ADD CONSTRAINT "SpeakingPrompt_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SpeakingSubmission" ADD CONSTRAINT "SpeakingSubmission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SpeakingSubmission" ADD CONSTRAINT "SpeakingSubmission_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "SpeakingPrompt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
