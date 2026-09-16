import { apiClient } from "./client";

export const firmPaymentApi = {
  async initiateEsewa(planId: string, amount: number) {
    const { data } = await apiClient.post("/firm-payment/esewa/initiate", { planId, amount });
    return data.data;
  },
  async initiateKhalti(planId: string, amount: number) {
    const { data } = await apiClient.post("/firm-payment/khalti/initiate", { planId, amount });
    return data.data;
  },
  async uploadVoucher(planId: string, amount: number, file: File) {
    const formData = new FormData();
    formData.append("planId", planId);
    formData.append("amount", String(amount));
    formData.append("file", file);
    const { data } = await apiClient.post("/firm-payment/voucher", formData, { headers: { "Content-Type": "multipart/form-data" } });
    return data.data;
  },
  async myTransactions() {
    const { data } = await apiClient.get("/firm-payment/my-transactions");
    return data.data;
  },
};
