import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "../api/notification.api";
import { SendNotificationPayload } from "../types/notification.types";

export function useSentNotifications() {
  return useQuery({
    queryKey: ["sent-notifications"],
    queryFn: () => notificationApi.listSent({ page: 1, limit: 50 }),
  });
}

export function useSendNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SendNotificationPayload) => notificationApi.send(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sent-notifications"] }),
  });
}
