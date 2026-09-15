import { apiClient } from "./client";

export interface MyVoucher {
  id: string;
  courseId: string;
  fileUrl: string;
  amount: number | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  submittedAt: string;
  rejectionReason: string | null;
  course: { id: string; name: string };
}

export const paymentVoucherApi = {
  async upload(courseId: string, file: File, amount?: number): Promise<MyVoucher> {
    const formData = new FormData();
    formData.append("courseId", courseId);
    if (amount) formData.append("amount", String(amount));
    formData.append("file", file);
    const { data } = await apiClient.post("/payment-vouchers", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data;
  },
  async myVouchers(): Promise<MyVoucher[]> {
    const { data } = await apiClient.get("/payment-vouchers/my");
    return data.data;
  },
};
