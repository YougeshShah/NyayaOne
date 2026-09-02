import { apiClient } from "./client";

export interface AccountingSummary {
  totalCollected: number;
  pendingCount: number;
  thisMonthCollected: number;
}
export interface Transaction {
  id: string;
  studentName?: string;
  courseName?: string;
  amount: number;
  paymentMethod: string;
  createdAt: string;
  receiptNumber?: string | null;
}

export const accountingApi = {
  async getSummary(): Promise<AccountingSummary> {
    const { data } = await apiClient.get("/institution-fee/summary/institution");
    return data.data;
  },
  async listTransactions(search?: string): Promise<Transaction[]> {
    const { data } = await apiClient.get("/institution-fee/transactions/institution", { params: { search } });
    return data.data;
  },
};
