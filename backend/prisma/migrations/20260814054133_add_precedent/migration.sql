-- CreateTable
CREATE TABLE "Precedent" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT,
    "sourceUrl" TEXT,
    "title" TEXT NOT NULL,
    "caseType" TEXT,
    "category" TEXT,
    "court" TEXT,
    "benchType" TEXT,
    "judges" TEXT,
    "decisionDate" TEXT,
    "caseNumber" TEXT,
    "petitioner" TEXT,
    "respondent" TEXT,
    "fullContent" TEXT NOT NULL,
    "hostLawFirmId" TEXT,
    "uploadedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Precedent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Precedent_sourceId_key" ON "Precedent"("sourceId");

-- CreateIndex
CREATE INDEX "Precedent_category_idx" ON "Precedent"("category");

-- CreateIndex
CREATE INDEX "Precedent_caseType_idx" ON "Precedent"("caseType");

-- CreateIndex
CREATE INDEX "Precedent_hostLawFirmId_idx" ON "Precedent"("hostLawFirmId");
