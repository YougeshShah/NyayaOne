import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { feedbackApi } from "../api/feedback.api";

export function useMyFeedback() {
  return useQuery({ queryKey: ["my-feedback"], queryFn: () => feedbackApi.mine() });
}

export function useSubmitFeedback() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { targetType: "LIVE_CLASS" | "MOCK_TEST" | "COURSE"; targetId: string; rating: number; comment?: string }) =>
      feedbackApi.submit(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-feedback"] }),
  });
}
