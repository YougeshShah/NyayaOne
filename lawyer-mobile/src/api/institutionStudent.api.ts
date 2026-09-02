import { apiClient } from "./client";

export interface InstitutionStudent {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  status: "ACTIVE" | "PENDING_VERIFICATION" | "SUSPENDED";
  createdAt: string;
}

export const institutionStudentApi = {
  async list(status?: "ACTIVE" | "PENDING_VERIFICATION"): Promise<InstitutionStudent[]> {
    const { data } = await apiClient.get("/auth/institution-students", { params: { status } });
    return data.data;
  },
  async approve(id: string) {
    const { data } = await apiClient.patch(`/auth/institution-students/${id}`, { status: "ACTIVE" });
    return data.data;
  },
  async reject(id: string) {
    await apiClient.delete(`/auth/institution-students/${id}`);
  },
  async suspend(id: string) {
    const { data } = await apiClient.patch(`/auth/institution-students/${id}`, { status: "SUSPENDED" });
    return data.data;
  },
};
