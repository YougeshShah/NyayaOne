import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { caseApi, UpdateCasePayload } from "../api/case.api";
import { CreateCasePayload, CaseStatus } from "../types/case.types";

export function useCases(params: { status?: CaseStatus; search?: string; page?: number }) {
  return useQuery({
    queryKey: ["cases", params],
    queryFn: () => caseApi.list(params),
  });
}

export function useCaseDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["case", id],
    queryFn: () => caseApi.getById(id as string),
    enabled: !!id,
  });
}

export function useCreateCase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCasePayload) => caseApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cases"] }),
  });
}

export function useUpdateCase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCasePayload }) => caseApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cases"] }),
  });
}
