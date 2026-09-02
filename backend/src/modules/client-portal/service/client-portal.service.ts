import { AppError } from "../../../common/errors/AppError";
import { clientPortalRepository } from "../repository/client-portal.repository";
import { documentRepository } from "../../document/repository/document.repository";
import { notificationRepository } from "../../notification/repository/notification.repository";
import { prisma } from "../../../database/prisma";
import * as path from "path";
import * as fs from "fs";

async function requireClientRecord(userId: string) {
  const client = await clientPortalRepository.findClientByUserId(userId);
  if (!client) {
    throw AppError.forbidden("No client profile is linked to this account");
  }
  return client;
}

export const clientPortalService = {
  async myCases(userId: string) {
    const client = await requireClientRecord(userId);
    return clientPortalRepository.findMyCases(client.id);
  },

  async myCaseById(userId: string, caseId: string) {
    const client = await requireClientRecord(userId);
    const caseRecord = await clientPortalRepository.findMyCaseById(caseId, client.id);
    if (!caseRecord) throw AppError.notFound("Case not found");
    return caseRecord;
  },

  async myHearings(userId: string, upcomingOnly: boolean) {
    const client = await requireClientRecord(userId);
    return clientPortalRepository.findMyHearings(client.id, upcomingOnly ? new Date() : undefined);
  },

  async myDocuments(userId: string) {
    const client = await requireClientRecord(userId);
    return clientPortalRepository.findMyDocuments(client.id);
  },

  async myDocumentById(userId: string, documentId: string) {
    const client = await requireClientRecord(userId);
    const doc = await clientPortalRepository.findDocumentByIdForClient(documentId, client.id);
    if (!doc) throw AppError.notFound("Document not found");
    return doc;
  },
  async uploadDocument(userId: string, caseId: string, category: string, file: Express.Multer.File) {
    const client = await requireClientRecord(userId);
    const caseRecord = await clientPortalRepository.findMyCaseById(caseId, client.id);
    if (!caseRecord) {
      fs.unlink(file.path, () => {});
      throw AppError.badRequest("Case not found or not linked to your account");
    }

    const relativePath = path.join(client.lawFirmId, path.basename(file.path));
    const doc = await documentRepository.create({
      lawFirmId: client.lawFirmId,
      caseId,
      fileName: file.originalname,
      fileUrl: relativePath,
      fileType: file.mimetype,
      fileSizeKb: Math.round(file.size / 1024),
      category: category as any,
      uploadedById: userId,
    });

    // Notify the lawyer(s) on this case that the client uploaded a document
    // -- best-effort, never blocks the actual upload if it fails.
    try {
      const lawyerLinks = await prisma.caseLawyer.findMany({
        where: { caseId },
        select: { lawyerId: true },
      });
      for (const { lawyerId } of lawyerLinks) {
        const notification = await notificationRepository.createNotification({
          title: "Document Uploaded",
          body: `${client.fullName} uploaded a document for case ${caseRecord.caseNumber}.`,
          audience: "INDIVIDUAL_USER",
          targetId: lawyerId,
          createdBy: userId,
        });
        await notificationRepository.bulkCreateUserNotifications(notification.id, [lawyerId]);
      }
    } catch {
      // Notification failure should never break the actual upload.
    }

    return doc;
  },
};
