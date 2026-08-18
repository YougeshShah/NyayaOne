-- Invoice + LiveClassHost tables -- deliberately excludes any ALTER on
-- Precedent.searchVector (unrelated generated column, same recurring
-- issue seen with earlier migrations this session).

CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED');

CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "lawFirmId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "billingPeriodStart" TIMESTAMP(3) NOT NULL,
    "billingPeriodEnd" TIMESTAMP(3) NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "paymentReference" TEXT,
    "paidAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LiveClassHost" (
    "id" TEXT NOT NULL,
    "liveClassId" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LiveClassHost_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");
CREATE INDEX "Invoice_lawFirmId_idx" ON "Invoice"("lawFirmId");
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");
CREATE INDEX "LiveClassHost_liveClassId_idx" ON "LiveClassHost"("liveClassId");
CREATE INDEX "LiveClassHost_hostId_idx" ON "LiveClassHost"("hostId");
CREATE UNIQUE INDEX "LiveClassHost_liveClassId_hostId_key" ON "LiveClassHost"("liveClassId", "hostId");

ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_lawFirmId_fkey" FOREIGN KEY ("lawFirmId") REFERENCES "LawFirm"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "FirmSubscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "LiveClassHost" ADD CONSTRAINT "LiveClassHost_liveClassId_fkey" FOREIGN KEY ("liveClassId") REFERENCES "LiveClass"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LiveClassHost" ADD CONSTRAINT "LiveClassHost_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
