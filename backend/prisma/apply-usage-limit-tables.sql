-- Usage limit tables only -- deliberately excludes any ALTER on
-- Precedent.searchVector (unrelated generated column, same issue seen
-- with earlier migrations this session).

CREATE TABLE "UsageLimit" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "lawFirmId" TEXT,
    "practiceLimit" INTEGER,
    "mockTestLimit" INTEGER,
    "speakingLimit" INTEGER,
    "updatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "UsageLimit_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PracticeSession" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PracticeSession_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "UsageLimit_courseId_idx" ON "UsageLimit"("courseId");
CREATE UNIQUE INDEX "UsageLimit_courseId_lawFirmId_key" ON "UsageLimit"("courseId", "lawFirmId");
CREATE INDEX "PracticeSession_studentId_idx" ON "PracticeSession"("studentId");
CREATE INDEX "PracticeSession_courseId_idx" ON "PracticeSession"("courseId");

ALTER TABLE "UsageLimit" ADD CONSTRAINT "UsageLimit_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UsageLimit" ADD CONSTRAINT "UsageLimit_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PracticeSession" ADD CONSTRAINT "PracticeSession_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PracticeSession" ADD CONSTRAINT "PracticeSession_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
