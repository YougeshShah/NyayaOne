import { apiClient } from "./client";

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
    const { data } = await apiClient.get("/tenant/roles");
    return data.data;
  },
  async listPermissions(): Promise<TenantPermission[]> {
    const { data } = await apiClient.get("/tenant/permissions");
    return data.data;
  },
  async createRole(payload: { name: string; description?: string }) {
    const { data } = await apiClient.post("/tenant/roles", payload);
    return data.data;
  },
  async updateRolePermissions(roleId: string, permissionKeys: string[]) {
    const { data } = await apiClient.put(`/tenant/roles/${roleId}/permissions`, { permissionKeys });
    return data.data;
  },
  async deleteRole(roleId: string) {
    const { data } = await apiClient.delete(`/tenant/roles/${roleId}`);
    return data.data;
  },
};
