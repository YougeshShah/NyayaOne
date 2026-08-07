import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { writingGradingApi } from "../api/writingGrading.api";

export function usePendingWritingSubmissions() {
  return useQuery({ queryKey: ["pending-writing"], queryFn: () => writingGradingApi.listPending() });
}

export function useGradeWriting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, score, feedback }: { id: string; score: number; feedback?: string }) =>
      writingGradingApi.grade(id, score, feedback),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pending-writing"] }),
  });
}
