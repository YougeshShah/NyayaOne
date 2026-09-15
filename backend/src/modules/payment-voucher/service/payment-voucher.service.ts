import { prisma } from "../../../database/prisma";
import { AppError } from "../../../common/errors/AppError";
import { paymentVoucherRepository } from "../repository/payment-voucher.repository";

export const paymentVoucherService = {
  async upload(studentId: string, courseId: string, fileUrl: string, amount?: number) {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw AppError.notFound("Course not found");
    return paymentVoucherRepository.create({ studentId, courseId, fileUrl, amount });
  },

  async myVouchers(studentId: string) {
    return paymentVoucherRepository.listForStudent(studentId);
  },

  // Allows viewing the uploaded receipt file to: the student who uploaded
  // it, or an admin from that same student's institution -- nobody else.
  async getFileForViewer(id: string, requesterId: string, requesterLawFirmId: string | null, requesterAccountType: string) {
    const voucher = await paymentVoucherRepository.findById(id);
    if (!voucher) throw AppError.notFound("Voucher not found");
    const isOwner = voucher.studentId === requesterId;
    const isFirmAdmin = requesterAccountType === "LAW_FIRM_ADMIN" && voucher.student.lawFirmId === requesterLawFirmId;
    if (!isOwner && !isFirmAdmin) {
      throw AppError.forbidden("You do not have access to this voucher");
    }
    return voucher;
  },

  async pendingForFirm(lawFirmId: string) {
    return paymentVoucherRepository.listPendingForFirm(lawFirmId);
  },

  async review(id: string, lawFirmId: string, reviewedBy: string, status: "APPROVED" | "REJECTED", rejectionReason?: string) {
    const voucher = await paymentVoucherRepository.findById(id);
    if (!voucher) throw AppError.notFound("Voucher not found");
    // Only this institution's own admin may review vouchers from their own
    // students -- same isolation pattern used everywhere else in the app.
    if (voucher.student.lawFirmId !== lawFirmId) {
      throw AppError.forbidden("This voucher does not belong to a student in your institution");
    }
    if (voucher.status !== "PENDING") {
      throw AppError.badRequest("This voucher has already been reviewed");
    }

    const updated = await paymentVoucherRepository.updateStatus(id, { status, reviewedBy, rejectionReason });

    if (status === "APPROVED") {
      // Grant access to exactly this course -- not a blanket "all courses"
      // unlock, matching the "only that subject gets access" requirement.
      await prisma.courseSubscription.upsert({
        where: { studentId_courseId: { studentId: voucher.studentId, courseId: voucher.courseId } },
        create: { studentId: voucher.studentId, courseId: voucher.courseId, status: "ACTIVE" },
        update: { status: "ACTIVE" },
      });
    }

    return updated;
  },
};
