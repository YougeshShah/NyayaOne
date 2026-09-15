import { prisma } from "../../../database/prisma";

export const paymentVoucherRepository = {
  create(data: { studentId: string; courseId: string; fileUrl: string; amount?: number }) {
    return prisma.paymentVoucher.create({ data });
  },

  findById(id: string) {
    return prisma.paymentVoucher.findUnique({
      where: { id },
      include: { student: { select: { id: true, fullName: true, email: true, lawFirmId: true } }, course: true },
    });
  },

  listForStudent(studentId: string) {
    return prisma.paymentVoucher.findMany({
      where: { studentId },
      include: { course: { select: { id: true, name: true } } },
      orderBy: { submittedAt: "desc" },
    });
  },

  // Only vouchers from students belonging to this institution -- keeps
  // one institution's admin from ever seeing another's pending vouchers.
  listPendingForFirm(lawFirmId: string) {
    return prisma.paymentVoucher.findMany({
      where: { status: "PENDING", student: { lawFirmId } },
      include: {
        student: { select: { id: true, fullName: true, email: true } },
        course: { select: { id: true, name: true } },
      },
      orderBy: { submittedAt: "asc" },
    });
  },

  updateStatus(id: string, data: { status: "APPROVED" | "REJECTED"; reviewedBy: string; rejectionReason?: string }) {
    return prisma.paymentVoucher.update({
      where: { id },
      data: { ...data, reviewedAt: new Date() },
    });
  },
};
