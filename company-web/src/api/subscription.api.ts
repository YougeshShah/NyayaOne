import { apiClient } from "./client";
import { ApiSuccessResponse, PaginatedResult } from "../types/api.types";
import { SubscriptionPlan, FirmSubscription, SubscriptionStatus } from "../types/subscription.types";

export interface CreatePlanPayload {
  name: string;
  description?: string;
  priceMonthly?: number;
  maxLawyers?: number;
  maxCases?: number;
  maxStorageMb?: number;
}

export const subscriptionApi = {
  async listPlans(): Promise<SubscriptionPlan[]> {
    const { data } = await apiClient.get<ApiSuccessResponse<SubscriptionPlan[]>>("/subscriptions/plans");
    return data.data;
  },

  async createPlan(payload: CreatePlanPayload): Promise<SubscriptionPlan> {
    const { data } = await apiClient.post<ApiSuccessResponse<SubscriptionPlan>>("/subscriptions/plans", payload);
    return data.data;
  },

  async updatePlan(id: string, payload: Partial<CreatePlanPayload> & { isActive?: boolean }): Promise<SubscriptionPlan> {
    const { data } = await apiClient.patch<ApiSuccessResponse<SubscriptionPlan>>(`/subscriptions/plans/${id}`, payload);
    return data.data;
  },

  async listSubscriptions(params: { status?: SubscriptionStatus; page?: number }) {
    const { data } = await apiClient.get<ApiSuccessResponse<PaginatedResult<FirmSubscription>>>("/subscriptions", { params });
    return data.data;
  },

  async assignPlan(payload: { lawFirmId: string; planId: string; status: SubscriptionStatus; expiresAt?: string }): Promise<FirmSubscription> {
    const { data } = await apiClient.post<ApiSuccessResponse<FirmSubscription>>("/subscriptions/assign", payload);
    return data.data;
  },

  async updateStatus(lawFirmId: string, status: SubscriptionStatus): Promise<FirmSubscription> {
    const { data } = await apiClient.patch<ApiSuccessResponse<FirmSubscription>>(`/subscriptions/${lawFirmId}/status`, { status });
    return data.data;
  },
};
