import { AppError } from "../../../common/errors/AppError";
import { prisma } from "../../../database/prisma";

export const caseTaskService = {
  async create(caseId: string, lawFirmId: string, title: string, assignedTo: string, description: string | undefined, dueDate: Date | undefined, createdBy: string) {
    const caseRecord = await prisma.case.findFirst({ where: { id: caseId, lawFirmId } });
    if (!caseRecord) throw AppError.notFound("Case not found");
    // Assignee must be staff at the SAME firm -- never assign a task to
    // someone outside the organization.
    const assignee = await prisma.user.findFirst({ where: { id: assignedTo, lawFirmId } });
    if (!assignee) throw AppError.badRequest("Assignee must be a member of your firm");
    return prisma.caseTask.create({
      data: { caseId, title, description, assignedTo, dueDate, createdBy },
      include: { assignee: { select: { id: true, fullName: true } } },
    });
  },

  async listForCase(caseId: string, lawFirmId: string) {
    const caseRecord = await prisma.case.findFirst({ where: { id: caseId, lawFirmId } });
    if (!caseRecord) throw AppError.notFound("Case not found");
    return prisma.caseTask.findMany({
      where: { caseId },
      include: { assignee: { select: { id: true, fullName: true } } },
      orderBy: [{ status: "asc" }, { dueDate: "asc" }],
    });
  },

  // A staff member's own task list across ALL their cases -- their personal "what do I owe" view.
  async myTasks(userId: string) {
    return prisma.caseTask.findMany({
      where: { assignedTo: userId, status: { not: "DONE" } },
      include: { case: { select: { id: true, caseNumber: true, caseTitle: true } } },
      orderBy: { dueDate: "asc" },
    });
  },

  async updateStatus(id: string, lawFirmId: string, status: "PENDING" | "IN_PROGRESS" | "DONE") {
    const task = await prisma.caseTask.findUnique({ where: { id }, include: { case: true } });
    if (!task || task.case.lawFirmId !== lawFirmId) throw AppError.notFound("Task not found");
    return prisma.caseTask.update({ where: { id }, data: { status } });
  },

  async remove(id: string, lawFirmId: string) {
    const task = await prisma.caseTask.findUnique({ where: { id }, include: { case: true } });
    if (!task || task.case.lawFirmId !== lawFirmId) throw AppError.notFound("Task not found");
    return prisma.caseTask.delete({ where: { id } });
  },
};
