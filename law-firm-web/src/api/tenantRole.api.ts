import { apiClient } from "./client";
import { ApiSuccessResponse } from "../types/api.types";

export interface TenantRoleWithPermissions {
  id: string;
  name: string;
  description: string | null;
  permissionKeys: string[];
}

export interface TenantPermission {
  id: string;
  key: string;
  description: string | null;
  module: string;
}

export const tenantRoleApi = {
  async listRoles(): Promise<TenantRoleWithPermissions[]> {
    const { data } = await apiClient.get<ApiSuccessResponse<TenantRoleWithPermissions[]>>("/tenant/roles");
    return data.data;
  },

  async listPermissions(): Promise<TenantPermission[]> {
    const { data } = await apiClient.get<ApiSuccessResponse<TenantPermission[]>>("/tenant/permissions");
    return data.data;
  },

  async createRole(payload: { name: string; description?: string }) {
    const { data } = await apiClient.post<ApiSuccessResponse<TenantRoleWithPermissions>>("/tenant/roles", payload);
    return data.data;
  },

  async updateRolePermissions(roleId: string, permissionKeys: string[]) {
    const { data } = await apiClient.put<ApiSuccessResponse<{ message: string }>>(`/tenant/roles/${roleId}/permissions`, {
      permissionKeys,
    });
    return data.data;
  },

  async deleteRole(roleId: string) {
    const { data } = await apiClient.delete<ApiSuccessResponse<{ message: string }>>(`/tenant/roles/${roleId}`);
    return data.data;
  },
};
