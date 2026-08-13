-- CreateEnum
CREATE TYPE "PasswordResetRequestStatus" AS ENUM ('PENDING', 'RESOLVED');

-- CreateTable
CREATE TABLE "PasswordResetRequest" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "note" TEXT,
    "status" "PasswordResetRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,

    CONSTRAINT "PasswordResetRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PasswordResetRequest_email_idx" ON "PasswordResetRequest"("email");

-- CreateIndex
CREATE INDEX "PasswordResetRequest_status_idx" ON "PasswordResetRequest"("status");
