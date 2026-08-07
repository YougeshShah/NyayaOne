import { useMutation } from "@tanstack/react-query";
import { profileApi, UpdateProfilePayload } from "../api/profile.api";
import { useAuthStore } from "../store/authStore";

export function useUpdateProfile() {
  const updateUser = useAuthStore((s) => s.updateUser);
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => profileApi.updateProfile(payload),
    onSuccess: (data) => {
      updateUser({ fullName: data.fullName, phone: data.phone, avatarUrl: data.avatarUrl });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      profileApi.changePassword(currentPassword, newPassword),
  });
}

export function useUploadAvatar() {
  const updateUser = useAuthStore((s) => s.updateUser);
  return useMutation({
    mutationFn: (file: File) => profileApi.uploadAvatar(file),
    onSuccess: (data) => {
      updateUser({ avatarUrl: data.avatarUrl });
    },
  });
}
