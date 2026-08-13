import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "../api/notification.api";

export function useMyNotifications() {
  return useQuery({
    queryKey: ["my-notifications"],
    queryFn: () => notificationApi.myNotifications(1, 30),
    refetchInterval: 60000, // poll every minute so the unread badge stays fresh without a full push setup
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-notifications"] }),
  });
}
