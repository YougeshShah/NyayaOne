-- CreateTable
CREATE TABLE "McqPracticeAttempt" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "McqPracticeAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "McqPracticeAttempt_studentId_idx" ON "McqPracticeAttempt"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "McqPracticeAttempt_studentId_questionId_key" ON "McqPracticeAttempt"("studentId", "questionId");
