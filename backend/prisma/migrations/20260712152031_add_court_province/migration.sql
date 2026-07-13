-- AlterTable
ALTER TABLE "Court" ADD COLUMN     "province" TEXT;

-- CreateIndex
CREATE INDEX "Court_province_idx" ON "Court"("province");
