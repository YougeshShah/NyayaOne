import { prisma } from "../../../database/prisma";

export const clientPortalRepository = {
  /**
   * Every client-portal query starts here: find the Client record linked to
   * this User account. This is the security boundary for the whole module —
   * a client can only ever see cases/hearings/documents tied to their own
   * Client record, never another client's, even within the same firm.
   */
  findClientByUserId(userId: string) {
    return prisma.client.findUnique({ where: { userId } });
  },

  findMyCases(clientId: string) {
    return prisma.case.findMany({
      where: { clients: { some: { clientId } } },
      orderBy: { createdAt: "desc" },
      include: {
        court: { select: { id: true, name: true, type: true, province: true } },
        lawyers: { include: { lawyer: { select: { id: true, fullName: true, email: true, phone: true } } } },
        _count: { select: { hearings: true, documents: true } },
      },
    });
  },

  findMyCaseById(caseId: string, clientId: string) {
    return prisma.case.findFirst({
      where: { id: caseId, clients: { some: { clientId } } },
      include: {
        court: { select: { id: true, name: true, type: true, province: true } },
        lawyers: { include: { lawyer: { select: { id: true, fullName: true, email: true, phone: true } } } },
        hearings: { orderBy: { hearingDate: "desc" } },
      },
    });
  },

  findMyHearings(clientId: string, from?: Date) {
    return prisma.hearing.findMany({
      where: {
        case: { clients: { some: { clientId } } },
        ...(from ? { hearingDate: { gte: from } } : {}),
      },
      orderBy: { hearingDate: "asc" },
      include: { case: { select: { id: true, caseNumber: true, caseTitle: true } } },
    });
  },

  findMyDocuments(clientId: string, clientUserId: string) {
    return prisma.document.findMany({
      // A document is visible to the client if the lawyer marked it
      // visible, OR the client themselves uploaded it (own uploads are
      // always visible to the person who added them).
      where: {
        case: { clients: { some: { clientId } } },
        OR: [{ visibleToClient: true }, { uploadedById: clientUserId }],
      },
      orderBy: { createdAt: "desc" },
      include: { case: { select: { id: true, caseNumber: true, caseTitle: true } } },
    });
  },

  findDocumentByIdForClient(documentId: string, clientId: string, clientUserId: string) {
    return prisma.document.findFirst({
      where: {
        id: documentId,
        case: { clients: { some: { clientId } } },
        OR: [{ visibleToClient: true }, { uploadedById: clientUserId }],
      },
    });
  },
};
