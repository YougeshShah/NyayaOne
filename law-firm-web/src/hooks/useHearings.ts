import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { hearingApi } from "../api/hearing.api";
import { CreateHearingPayload } from "../types/hearing.types";

export function useHearings(params: { caseId?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["hearings", params],
    queryFn: () => hearingApi.list(params),
  });
}

export function useTodayHearings() {
  return useQuery({ queryKey: ["hearings-today"], queryFn: () => hearingApi.today() });
}

export function useUpcomingHearings() {
  return useQuery({ queryKey: ["hearings-upcoming"], queryFn: () => hearingApi.upcoming() });
}

export function useCreateHearing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateHearingPayload) => hearingApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hearings"] });
      queryClient.invalidateQueries({ queryKey: ["hearings-today"] });
      queryClient.invalidateQueries({ queryKey: ["hearings-upcoming"] });
      queryClient.invalidateQueries({ queryKey: ["cases"] });
    },
  });
}

export function useUpdateHearing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { hearingDate?: string; judge?: string; notes?: string; status?: string } }) =>
      hearingApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hearings"] });
      queryClient.invalidateQueries({ queryKey: ["hearings-today"] });
      queryClient.invalidateQueries({ queryKey: ["hearings-upcoming"] });
    },
  });
}
