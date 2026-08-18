-- Staff payroll tables -- deliberately excludes any ALTER on
-- Precedent.searchVector (unrelated generated column, same recurring
-- issue seen with earlier migrations this session).

CREATE TYPE "SalaryType" AS ENUM ('FIXED_MONTHLY', 'PER_CLASS', 'HOURLY');

CREATE TABLE "StaffSalary" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "lawFirmId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "salaryType" "SalaryType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "StaffSalary_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StaffPayment" (
    "id" TEXT NOT NULL,
    "staffSalaryId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paidForPeriod" TEXT,
    "paymentMethod" TEXT NOT NULL,
    "receiptNumber" TEXT,
    "recordedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StaffPayment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "StaffSalary_lawFirmId_idx" ON "StaffSalary"("lawFirmId");
CREATE UNIQUE INDEX "StaffSalary_staffId_lawFirmId_key" ON "StaffSalary"("staffId", "lawFirmId");
CREATE INDEX "StaffPayment_staffSalaryId_idx" ON "StaffPayment"("staffSalaryId");

ALTER TABLE "StaffSalary" ADD CONSTRAINT "StaffSalary_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StaffSalary" ADD CONSTRAINT "StaffSalary_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StaffPayment" ADD CONSTRAINT "StaffPayment_staffSalaryId_fkey" FOREIGN KEY ("staffSalaryId") REFERENCES "StaffSalary"("id") ON DELETE CASCADE ON UPDATE CASCADE;
