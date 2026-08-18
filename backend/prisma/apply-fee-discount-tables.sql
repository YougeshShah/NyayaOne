-- Fee/Discount tables + PaymentGateway enum update -- deliberately
-- excludes any ALTER on Precedent.searchVector (unrelated generated
-- column, same recurring issue seen with earlier migrations this session).

CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');
ALTER TYPE "PaymentGateway" ADD VALUE 'MANUAL';

CREATE TABLE "CourseFee" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "lawFirmId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CourseFee_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StudentDiscount" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "type" "DiscountType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "reason" TEXT,
    "grantedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StudentDiscount_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CourseFee_courseId_idx" ON "CourseFee"("courseId");
CREATE INDEX "CourseFee_lawFirmId_idx" ON "CourseFee"("lawFirmId");
CREATE INDEX "StudentDiscount_studentId_idx" ON "StudentDiscount"("studentId");
CREATE INDEX "StudentDiscount_courseId_idx" ON "StudentDiscount"("courseId");
CREATE UNIQUE INDEX "StudentDiscount_studentId_courseId_key" ON "StudentDiscount"("studentId", "courseId");

ALTER TABLE "CourseFee" ADD CONSTRAINT "CourseFee_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CourseFee" ADD CONSTRAINT "CourseFee_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudentDiscount" ADD CONSTRAINT "StudentDiscount_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudentDiscount" ADD CONSTRAINT "StudentDiscount_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
