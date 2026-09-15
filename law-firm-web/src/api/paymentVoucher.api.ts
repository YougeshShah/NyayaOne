import { apiClient } from "./client";

export interface PendingVoucher {
  id: string;
  fileUrl: string;
  amount: number | null;
  submittedAt: string;
  student: { id: string; fullName: string; email: string };
  course: { id: string; name: string };
}

export const paymentVoucherApi = {
  async pending(): Promise<PendingVoucher[]> {
    const { data } = await apiClient.get("/payment-vouchers/pending");
    return data.data;
  },
  async review(id: string, status: "APPROVED" | "REJECTED", rejectionReason?: string) {
    const { data } = await apiClient.patch(`/payment-vouchers/${id}/review`, { status, rejectionReason });
    return data.data;
  },
};
