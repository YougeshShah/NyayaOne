import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { subscriptionApi, CreatePlanPayload } from "../api/subscription.api";
import { SubscriptionStatus } from "../types/subscription.types";

export function usePlans() {
  return useQuery({ queryKey: ["subscription-plans"], queryFn: () => subscriptionApi.listPlans() });
}

export function useSubscriptions(params: { status?: SubscriptionStatus; page?: number }) {
  return useQuery({ queryKey: ["subscriptions", params], queryFn: () => subscriptionApi.listSubscriptions(params) });
}

export function useSubscriptionActions() {
  const queryClient = useQueryClient();
  const invalidatePlans = () => queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
  const invalidateSubs = () => queryClient.invalidateQueries({ queryKey: ["subscriptions"] });

  const createPlan = useMutation({
    mutationFn: (payload: CreatePlanPayload) => subscriptionApi.createPlan(payload),
    onSuccess: invalidatePlans,
  });

  const assignPlan = useMutation({
    mutationFn: (payload: { lawFirmId: string; planId: string; status: SubscriptionStatus }) => subscriptionApi.assignPlan(payload),
    onSuccess: invalidateSubs,
  });

  const updateStatus = useMutation({
    mutationFn: ({ lawFirmId, status }: { lawFirmId: string; status: SubscriptionStatus }) => subscriptionApi.updateStatus(lawFirmId, status),
    onSuccess: invalidateSubs,
  });

  return { createPlan, assignPlan, updateStatus };
}
