import { prisma } from "../../../database/prisma";
import { AppError } from "../../../common/errors/AppError";

type AuthUser = { userId: string; accountType: string; lawFirmId: string | null };

const ticketListSelect = {
  id: true,
  subject: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  lawFirm: { select: { id: true, name: true } },
  createdBy: { select: { id: true, fullName: true } },
};

export const ticketService = {
  // Only a tenant admin (law firm or institution) can open a ticket --
  // matches "Institution/LawFirm <-> Company" support, not every staff
  // member individually.
  async create(
    auth: AuthUser,
    subject: string,
    description: string,
    attachmentUrl?: string,
    attachmentType?: string
  ) {
    if (auth.accountType !== "LAW_FIRM_ADMIN" || !auth.lawFirmId) {
      throw AppError.forbidden("Only a law firm/institution admin can open a support ticket.");
    }
    return prisma.supportTicket.create({
      data: { lawFirmId: auth.lawFirmId, createdById: auth.userId, subject, description, attachmentUrl, attachmentType },
    });
  },

  async list(auth: AuthUser, status: string | undefined, page: number, limit: number) {
    const where: any = {};
    if (auth.accountType === "COMPANY") {
      // sees every institution's tickets
    } else if (auth.accountType === "LAW_FIRM_ADMIN" && auth.lawFirmId) {
      where.lawFirmId = auth.lawFirmId;
    } else {
      throw AppError.forbidden();
    }
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        select: ticketListSelect,
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.supportTicket.count({ where }),
    ]);

    return { items, page, total, totalPages: Math.ceil(total / limit) };
  },

  async assertAccess(auth: AuthUser, ticketId: string) {
    const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw AppError.notFound("Ticket not found.");
    if (auth.accountType === "COMPANY") return ticket;
    if (auth.accountType === "LAW_FIRM_ADMIN" && auth.lawFirmId === ticket.lawFirmId) return ticket;
    throw AppError.forbidden();
  },

  async getById(auth: AuthUser, ticketId: string) {
    const ticket = await this.assertAccess(auth, ticketId);
    const [comments, lawFirm, createdBy] = await Promise.all([
      prisma.ticketComment.findMany({
        where: { ticketId },
        orderBy: { createdAt: "asc" },
        include: { author: { select: { id: true, fullName: true, accountType: true } } },
      }),
      prisma.lawFirm.findUnique({ where: { id: ticket.lawFirmId }, select: { id: true, name: true } }),
      prisma.user.findUnique({ where: { id: ticket.createdById }, select: { id: true, fullName: true } }),
    ]);
    return { ...ticket, lawFirm, createdBy, comments };
  },

  async addComment(auth: AuthUser, ticketId: string, content: string, attachmentUrl?: string, attachmentType?: string) {
    const ticket = await this.assertAccess(auth, ticketId);
    if (ticket.status === "CLOSED") throw AppError.badRequest("This ticket is closed.");

    const trimmed = content.trim();
    if (!trimmed && !attachmentUrl) {
      throw AppError.badRequest("Reply must have text or an attachment.");
    }

    // First reply from Company support automatically moves an OPEN ticket
    // to IN_PROGRESS -- gives the institution visible confirmation someone
    // has picked it up.
    const nextStatus = ticket.status === "OPEN" && auth.accountType === "COMPANY" ? "IN_PROGRESS" : ticket.status;

    const [comment] = await prisma.$transaction([
      prisma.ticketComment.create({ data: { ticketId, authorId: auth.userId, content: trimmed, attachmentUrl, attachmentType } }),
      prisma.supportTicket.update({ where: { id: ticketId }, data: { status: nextStatus as any } }),
    ]);
    return comment;
  },

  async updateStatus(auth: AuthUser, ticketId: string, status: string) {
    const ticket = await this.assertAccess(auth, ticketId);
    // Company can set any status; the ticket's own creator may only close it.
    if (auth.accountType !== "COMPANY") {
      if (!(auth.userId === ticket.createdById && status === "CLOSED")) {
        throw AppError.forbidden("Only TechnoOne support can change ticket status (you may close your own ticket).");
      }
    }
    return prisma.supportTicket.update({ where: { id: ticketId }, data: { status: status as any } });
  },
};
