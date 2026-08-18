import { z } from "zod";

export const setFeeSchema = z.object({
  courseId: z.string().uuid(),
  amount: z.number().positive(),
});
export type SetFeeInput = z.infer<typeof setFeeSchema>;

export const grantDiscountSchema = z.object({
  studentId: z.string().uuid(),
  courseId: z.string().uuid(),
  type: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
  value: z.number().positive(),
  reason: z.string().optional(),
});
export type GrantDiscountInput = z.infer<typeof grantDiscountSchema>;

export const recordManualPaymentSchema = z.object({
  studentId: z.string().uuid(),
  courseId: z.string().uuid(),
  amount: z.number().positive(),
  paymentMethod: z.enum(["CASH", "BANK_TRANSFER", "QR_SCAN"]),
  receiptNumber: z.string().optional(),
});
export type RecordManualPaymentInput = z.infer<typeof recordManualPaymentSchema>;

export const courseIdParamSchema = z.object({ courseId: z.string().uuid() });
export const idParamSchema = z.object({ id: z.string().uuid() });
