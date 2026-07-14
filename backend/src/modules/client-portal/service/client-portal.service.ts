import { AppError } from "../../../common/errors/AppError";
import { clientPortalRepository } from "../repository/client-portal.repository";

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
};
