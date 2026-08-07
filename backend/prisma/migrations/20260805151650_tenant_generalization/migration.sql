-- CreateEnum
CREATE TYPE "TenantType" AS ENUM ('LAW_FIRM', 'EDUCATION', 'OTHER');

-- AlterTable
ALTER TABLE "LawFirm" ADD COLUMN     "modulesEnabled" TEXT[] DEFAULT ARRAY['case_management']::TEXT[],
ADD COLUMN     "tenantType" "TenantType" NOT NULL DEFAULT 'LAW_FIRM';

-- CreateIndex
CREATE INDEX "LawFirm_tenantType_idx" ON "LawFirm"("tenantType");
