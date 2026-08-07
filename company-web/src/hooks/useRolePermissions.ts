import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rolePermissionApi } from "../api/rolePermission.api";

export function useRoles() {
  return useQuery({ queryKey: ["roles-permissions"], queryFn: () => rolePermissionApi.listRoles() });
}

export function usePermissionsList() {
  return useQuery({ queryKey: ["permissions-list"], queryFn: () => rolePermissionApi.listPermissions() });
}

export function useRolePermissionActions() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["roles-permissions"] });

  const createRole = useMutation({
    mutationFn: (payload: { name: string; description?: string }) => rolePermissionApi.createRole(payload),
    onSuccess: invalidate,
  });

  const updatePermissions = useMutation({
    mutationFn: ({ roleId, permissionKeys }: { roleId: string; permissionKeys: string[] }) =>
      rolePermissionApi.updateRolePermissions(roleId, permissionKeys),
    onSuccess: invalidate,
  });

  const deleteRole = useMutation({
    mutationFn: (roleId: string) => rolePermissionApi.deleteRole(roleId),
    onSuccess: invalidate,
  });

  return { createRole, updatePermissions, deleteRole };
}
