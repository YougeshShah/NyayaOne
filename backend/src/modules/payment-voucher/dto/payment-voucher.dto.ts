import { z } from "zod";

export const uploadVoucherSchema = z.object({
  courseId: z.string().uuid(),
  amount: z.coerce.number().positive().optional(),
});
export type UploadVoucherInput = z.infer<typeof uploadVoucherSchema>;

export const reviewVoucherSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  rejectionReason: z.string().optional(),
}).refine((data) => data.status !== "REJECTED" || !!data.rejectionReason, {
  message: "rejectionReason is required when rejecting a voucher",
  path: ["rejectionReason"],
});
export type ReviewVoucherInput = z.infer<typeof reviewVoucherSchema>;
