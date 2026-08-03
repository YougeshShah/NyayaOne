import { useMutation, useQuery } from "@tanstack/react-query";
import { clientPortalApi } from "../api/clientPortal.api";
import { authExtraApi, UpdateProfilePayload } from "../api/authExtra.api";
import { useAuthStore } from "../store/authStore";

export function useMyCases() {
  return useQuery({ queryKey: ["my-cases"], queryFn: () => clientPortalApi.myCases() });
}

export function useMyCaseDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["my-case", id],
    queryFn: () => clientPortalApi.myCaseById(id as string),
    enabled: !!id,
  });
}

export function useMyHearings(upcomingOnly = false) {
  return useQuery({ queryKey: ["my-hearings", upcomingOnly], queryFn: () => clientPortalApi.myHearings(upcomingOnly) });
}

export function useMyDocuments() {
  return useQuery({ queryKey: ["my-documents"], queryFn: () => clientPortalApi.myDocuments() });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      authExtraApi.changePassword(currentPassword, newPassword),
  });
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
