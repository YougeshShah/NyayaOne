import { apiClient } from "./client";
import { ApiSuccessResponse, PaginatedResult } from "../types/api.types";

export interface Transaction {
  id: string;
  gateway: "ESEWA" | "KHALTI";
  amount: number;
  status: "PENDING" | "COMPLETED" | "FAILED";
  transactionUuid: string;
  createdAt: string;
  student: { fullName: string; email: string };
  course: { name: string };
}

export const transactionApi = {
  async list(params: { status?: string; gateway?: string; page?: number }) {
    const { data } = await apiClient.get<ApiSuccessResponse<PaginatedResult<Transaction>>>("/payment/transactions", { params });
    return data.data;
  },
};
