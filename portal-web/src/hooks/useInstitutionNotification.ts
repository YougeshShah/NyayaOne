import { useMutation } from "@tanstack/react-query";
import { institutionNotificationApi } from "../api/institutionNotification.api";

export function useNotifyMyStudents() {
  return useMutation({
    mutationFn: ({ title, body, lawFirmId }: { title: string; body: string; lawFirmId: string }) =>
      institutionNotificationApi.notifyMyStudents(title, body, lawFirmId),
  });
}
