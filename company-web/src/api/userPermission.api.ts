import { apiClient } from "./client";
import { ApiSuccessResponse } from "../types/api.types";

export interface PermissionRow {
  permissionId: string;
  key: string;
  description: string | null;
  module: string;
  fromRole: boolean;
  override: "GRANT" | "REVOKE" | null;
  overrideReason: string | null;
  effective: boolean;
}

export interface UserPermissionsResult {
  userId: string;
  userFullName: string;
  roleName: string | null;
  permissions: PermissionRow[];
}

export const userPermissionApi = {
  async listForUser(userId: string): Promise<UserPermissionsResult> {
    const { data } = await apiClient.get<ApiSuccessResponse<UserPermissionsResult>>(`/user-permissions/company/${userId}`);
    return data.data;
  },

  async setOverride(userId: string, permissionId: string, granted: boolean, reason?: string) {
    const { data } = await apiClient.put<ApiSuccessResponse<any>>(`/user-permissions/company/${userId}`, {
      permissionId,
      granted,
      reason,
    });
    return data.data;
  },

  async removeOverride(userId: string, permissionId: string) {
    await apiClient.delete(`/user-permissions/company/${userId}/${permissionId}`);
  },
};
