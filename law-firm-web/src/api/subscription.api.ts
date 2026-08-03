import { apiClient } from "./client";
import { ApiSuccessResponse } from "../types/api.types";

export interface MyFirmSubscription {
  id: string;
  status: "TRIAL" | "ACTIVE" | "EXPIRED" | "CANCELLED";
  startedAt: string;
  expiresAt: string | null;
  plan: {
    id: string;
    name: string;
    priceMonthly: number | null;
    maxLawyers: number | null;
    maxCases: number | null;
  };
  usage: {
    lawyers: { used: number; limit: number | null };
    cases: { used: number; limit: number | null };
  };
}

export const subscriptionApi = {
  async myFirm(): Promise<MyFirmSubscription | null> {
    const { data } = await apiClient.get<ApiSuccessResponse<MyFirmSubscription | null>>("/subscriptions/my-firm");
    return data.data;
  },
};
