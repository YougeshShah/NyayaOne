-- AlterTable
ALTER TABLE "Message" ADD COLUMN "attachmentUrl" TEXT;
ALTER TABLE "Message" ADD COLUMN "attachmentType" TEXT;

-- AlterTable
ALTER TABLE "SupportTicket" ADD COLUMN "attachmentUrl" TEXT;
ALTER TABLE "SupportTicket" ADD COLUMN "attachmentType" TEXT;

-- AlterTable
ALTER TABLE "TicketComment" ADD COLUMN "attachmentUrl" TEXT;
ALTER TABLE "TicketComment" ADD COLUMN "attachmentType" TEXT;
