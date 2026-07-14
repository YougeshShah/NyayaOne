import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { caseApi, hearingApi, clientApi, UpdateHearingPayload } from "../api/domain.api";
import { authExtraApi } from "../api/authExtra.api";
import { CaseStatus } from "../types";

export function useCases(params: { status?: CaseStatus; search?: string } = {}) {
  return useQuery({ queryKey: ["cases", params], queryFn: () => caseApi.list(params) });
}

export function useCaseDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["case", id],
    queryFn: () => caseApi.getById(id as string),
    enabled: !!id,
  });
}

export function useTodayHearings() {
  return useQuery({ queryKey: ["hearings-today"], queryFn: () => hearingApi.today() });
}

export function useUpcomingHearings() {
  return useQuery({ queryKey: ["hearings-upcoming"], queryFn: () => hearingApi.upcoming() });
}

export function useAllHearings() {
  return useQuery({ queryKey: ["hearings-all"], queryFn: () => hearingApi.list({ limit: 100 }) });
}

export function useUpdateHearing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateHearingPayload }) => hearingApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hearings-today"] });
      queryClient.invalidateQueries({ queryKey: ["hearings-upcoming"] });
      queryClient.invalidateQueries({ queryKey: ["hearings-all"] });
      queryClient.invalidateQueries({ queryKey: ["case"] });
    },
  });
}

export function useClients(search?: string) {
  return useQuery({ queryKey: ["clients", search], queryFn: () => clientApi.list({ search }) });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      authExtraApi.changePassword(currentPassword, newPassword),
  });
}
