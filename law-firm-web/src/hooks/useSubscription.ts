import { useQuery } from "@tanstack/react-query";
import { subscriptionApi } from "../api/subscription.api";

export function useMyFirmSubscription() {
  return useQuery({ queryKey: ["my-firm-subscription"], queryFn: () => subscriptionApi.myFirm() });
}
