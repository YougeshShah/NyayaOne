import { AppError } from "../../../common/errors/AppError";
import { prisma } from "../../../database/prisma";

export const caseDeadlineService = {
  async create(caseId: string, lawFirmId: string, title: string, dueAt: Date, remindAt: Date, createdBy: string) {
    const caseRecord = await prisma.case.findFirst({ where: { id: caseId, lawFirmId } });
    if (!caseRecord) throw AppError.notFound("Case not found");
    return prisma.caseDeadline.create({ data: { caseId, title, dueAt, remindAt, createdBy } });
  },

  async listForCase(caseId: string, lawFirmId: string) {
    const caseRecord = await prisma.case.findFirst({ where: { id: caseId, lawFirmId } });
    if (!caseRecord) throw AppError.notFound("Case not found");
    return prisma.caseDeadline.findMany({ where: { caseId }, orderBy: { dueAt: "asc" } });
  },

  async remove(id: string, lawFirmId: string) {
    const deadline = await prisma.caseDeadline.findUnique({ where: { id }, include: { case: true } });
    if (!deadline || deadline.case.lawFirmId !== lawFirmId) throw AppError.notFound("Deadline not found");
    return prisma.caseDeadline.delete({ where: { id } });
  },
};
