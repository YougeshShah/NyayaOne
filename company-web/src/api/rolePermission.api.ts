import { apiClient } from "./client";
import { ApiSuccessResponse } from "../types/api.types";

export interface RoleWithPermissions {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissionKeys: string[];
}

export interface Permission {
  id: string;
  key: string;
  description: string | null;
  module: string;
}

export const rolePermissionApi = {
  async listRoles(): Promise<RoleWithPermissions[]> {
    const { data } = await apiClient.get<ApiSuccessResponse<RoleWithPermissions[]>>("/admin/roles");
    return data.data;
  },

  async listPermissions(): Promise<Permission[]> {
    const { data } = await apiClient.get<ApiSuccessResponse<Permission[]>>("/admin/permissions");
    return data.data;
  },

  async createRole(payload: { name: string; description?: string }) {
    const { data } = await apiClient.post<ApiSuccessResponse<RoleWithPermissions>>("/admin/roles", payload);
    return data.data;
  },

  async updateRolePermissions(roleId: string, permissionKeys: string[]) {
    const { data } = await apiClient.put<ApiSuccessResponse<{ message: string }>>(`/admin/roles/${roleId}/permissions`, {
      permissionKeys,
    });
    return data.data;
  },

  async deleteRole(roleId: string) {
    const { data } = await apiClient.delete<ApiSuccessResponse<{ message: string }>>(`/admin/roles/${roleId}`);
    return data.data;
  },
};
