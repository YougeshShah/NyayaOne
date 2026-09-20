import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userPermissionApi } from "../api/userPermission.api";

export function useUserPermissions(userId: string | undefined) {
  return useQuery({
    queryKey: ["user-permissions", userId],
    queryFn: () => userPermissionApi.listForUser(userId as string),
    enabled: !!userId,
  });
}

export function useSetPermissionOverride(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ permissionId, granted, reason }: { permissionId: string; granted: boolean; reason?: string }) =>
      userPermissionApi.setOverride(userId as string, permissionId, granted, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user-permissions", userId] }),
  });
}

export function useRemovePermissionOverride(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (permissionId: string) => userPermissionApi.removeOverride(userId as string, permissionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user-permissions", userId] }),
  });
}
