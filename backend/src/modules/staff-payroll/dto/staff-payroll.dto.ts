import { z } from "zod";

export const setSalarySchema = z.object({
  staffId: z.string().uuid(),
  category: z.string().min(1),
  salaryType: z.enum(["FIXED_MONTHLY", "PER_CLASS", "HOURLY"]),
  amount: z.number().positive(),
});
export type SetSalaryInput = z.infer<typeof setSalarySchema>;

export const recordPaymentSchema = z.object({
  staffId: z.string().uuid(),
  amount: z.number().positive(),
  paidForPeriod: z.string().optional(),
  paymentMethod: z.enum(["CASH", "BANK_TRANSFER", "QR_SCAN"]),
  receiptNumber: z.string().optional(),
});
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;

export const staffIdParamSchema = z.object({ staffId: z.string().uuid() });
