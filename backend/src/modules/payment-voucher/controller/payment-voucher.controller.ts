import { Request, Response } from "express";
import { paymentVoucherService } from "../service/payment-voucher.service";
import { uploadVoucherSchema, reviewVoucherSchema } from "../dto/payment-voucher.dto";
import { AppError } from "../../../common/errors/AppError";

export const paymentVoucherController = {
  async upload(req: Request, res: Response) {
    const input = uploadVoucherSchema.parse(req.body);
    if (!req.file) throw AppError.badRequest("Voucher file (receipt/screenshot) is required");
    const studentId = req.auth!.userId;
    const fileUrl = `/uploads/vouchers/${req.file.filename}`;
    const result = await paymentVoucherService.upload(studentId, input.courseId, fileUrl, input.amount);
    res.status(201).json({ success: true, data: result });
  },

  async myVouchers(req: Request, res: Response) {
    const studentId = req.auth!.userId;
    const result = await paymentVoucherService.myVouchers(studentId);
    res.status(200).json({ success: true, data: result });
  },

  async pending(req: Request, res: Response) {
    const lawFirmId = req.auth!.lawFirmId!;
    const result = await paymentVoucherService.pendingForFirm(lawFirmId);
    res.status(200).json({ success: true, data: result });
  },

  async review(req: Request, res: Response) {
    const { id } = req.params;
    const input = reviewVoucherSchema.parse(req.body);
    const lawFirmId = req.auth!.lawFirmId!;
    const reviewedBy = req.auth!.userId;
    const result = await paymentVoucherService.review(id, lawFirmId, reviewedBy, input.status, input.rejectionReason);
    res.status(200).json({ success: true, data: result });
  },
};
