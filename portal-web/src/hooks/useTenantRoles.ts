import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tenantRoleApi } from "../api/tenantRole.api";

export function useTenantRoles() {
  return useQuery({ queryKey: ["tenant-roles"], queryFn: () => tenantRoleApi.listRoles() });
}

export function useTenantPermissionsList() {
  return useQuery({ queryKey: ["tenant-permissions"], queryFn: () => tenantRoleApi.listPermissions() });
}

export function useTenantRoleActions() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["tenant-roles"] });

  const createRole = useMutation({
    mutationFn: (payload: { name: string; description?: string }) => tenantRoleApi.createRole(payload),
    onSuccess: invalidate,
  });

  const updatePermissions = useMutation({
    mutationFn: ({ roleId, permissionKeys }: { roleId: string; permissionKeys: string[] }) =>
      tenantRoleApi.updateRolePermissions(roleId, permissionKeys),
    onSuccess: invalidate,
  });

  const deleteRole = useMutation({
    mutationFn: (roleId: string) => tenantRoleApi.deleteRole(roleId),
    onSuccess: invalidate,
  });

  return { createRole, updatePermissions, deleteRole };
}
