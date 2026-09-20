import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { caseApi, hearingApi, clientApi, courtApi, userApi, UpdateHearingPayload, CreateCasePayload, CreateHearingPayload, CreateClientPayload } from "../api/domain.api";
import { authExtraApi, UpdateProfilePayload } from "../api/authExtra.api";
import { useAuthStore } from "../store/authStore";
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

export function useClient(id: string | undefined) {
  return useQuery({ queryKey: ["client", id], queryFn: () => clientApi.getById(id as string), enabled: !!id });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateClientPayload> }) => clientApi.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["client", variables.id] });
    },
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateClientPayload) => clientApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clients"] }),
  });
}

export function useCourts(search?: string) {
  return useQuery({ queryKey: ["courts", search], queryFn: () => courtApi.list({ search }) });
}

export function useInviteClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) => clientApi.invite(id, password),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clients"] }),
  });
}

export function useLawyers() {
  return useQuery({ queryKey: ["lawyers"], queryFn: () => userApi.listLawyers() });
}

export function useFirmUsers(params: { accountType?: "LAWYER" | "STAFF"; status?: string; search?: string } = {}) {
  return useQuery({ queryKey: ["firm-users", params], queryFn: () => userApi.listAll(params) });
}

export function useFirmUserActions() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["firm-users"] });
  const create = useMutation({
    mutationFn: (payload: import("../api/domain.api").CreateFirmUserPayload) => userApi.createFirmUser(payload),
    onSuccess: invalidate,
  });
  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => userApi.updateFirmUserStatus(id, status),
    onSuccess: invalidate,
  });
  const resetPassword = useMutation({
    mutationFn: (id: string) => userApi.resetFirmUserPassword(id),
  });
  return { create, updateStatus, resetPassword };
}

export function useCreateCase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCasePayload) => caseApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cases"] }),
  });
}

export function useCreateHearing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateHearingPayload) => hearingApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hearings-today"] });
      queryClient.invalidateQueries({ queryKey: ["hearings-upcoming"] });
      queryClient.invalidateQueries({ queryKey: ["hearings-all"] });
      queryClient.invalidateQueries({ queryKey: ["cases"] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      authExtraApi.changePassword(currentPassword, newPassword),
  });
}

export function useMyProfile() {
  return useQuery({ queryKey: ["my-profile"], queryFn: () => authExtraApi.getMe() });
}

export function useUpdateProfile() {
  const updateUser = useAuthStore((s) => s.updateUser);
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => authExtraApi.updateProfile(payload),
    onSuccess: (data) => {
      updateUser({ fullName: data.fullName, phone: data.phone || undefined });
    },
  });
}

export function useUploadAvatar() {
  const updateUser = useAuthStore((s) => s.updateUser);
  return useMutation({
    mutationFn: (fileUri: string) => authExtraApi.uploadAvatar(fileUri),
    onSuccess: (data) => {
      updateUser({ avatarUrl: data.avatarUrl });
    },
  });
}
