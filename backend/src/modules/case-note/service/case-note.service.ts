import { AppError } from "../../../common/errors/AppError";
import { prisma } from "../../../database/prisma";

export const caseNoteService = {
  async create(caseId: string, lawFirmId: string, content: string, createdBy: string) {
    // Confirm the case belongs to this firm before allowing a note on it --
    // same isolation pattern as everywhere else in the app.
    const caseRecord = await prisma.case.findFirst({ where: { id: caseId, lawFirmId } });
    if (!caseRecord) throw AppError.notFound("Case not found");
    return prisma.caseNote.create({
      data: { caseId, content, createdBy },
      include: { author: { select: { id: true, fullName: true } } },
    });
  },

  async listForCase(caseId: string, lawFirmId: string) {
    const caseRecord = await prisma.case.findFirst({ where: { id: caseId, lawFirmId } });
    if (!caseRecord) throw AppError.notFound("Case not found");
    return prisma.caseNote.findMany({
      where: { caseId },
      include: { author: { select: { id: true, fullName: true } } },
      orderBy: { createdAt: "desc" },
    });
  },

  async remove(id: string, lawFirmId: string) {
    const note = await prisma.caseNote.findUnique({ where: { id }, include: { case: true } });
    if (!note || note.case.lawFirmId !== lawFirmId) throw AppError.notFound("Note not found");
    return prisma.caseNote.delete({ where: { id } });
  },
};
