import { apiClient } from "./client";
import { ApiSuccessResponse } from "../types/api.types";

export interface InstitutionStudent {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  status: "ACTIVE" | "PENDING_VERIFICATION" | "SUSPENDED";
  createdAt: string;
}

export interface AddStudentPayload {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  interestedCourseId: string;
  preferredExamType?: string;
}

export interface UpdateStudentPayload {
  fullName?: string;
  phone?: string;
  status?: "ACTIVE" | "PENDING_VERIFICATION" | "SUSPENDED";
  preferredCourseId?: string;
  preferredExamType?: string;
}

export const institutionStudentApi = {
  async list(status?: "ACTIVE" | "PENDING_VERIFICATION"): Promise<InstitutionStudent[]> {
    const { data } = await apiClient.get<ApiSuccessResponse<InstitutionStudent[]>>("/auth/institution-students", { params: { status } });
    return data.data;
  },
  async add(payload: AddStudentPayload) {
    const { data } = await apiClient.post<ApiSuccessResponse<any>>("/auth/institution-students", payload);
    return data.data;
  },
  async update(id: string, payload: UpdateStudentPayload) {
    const { data } = await apiClient.patch<ApiSuccessResponse<InstitutionStudent>>(`/auth/institution-students/${id}`, payload);
    return data.data;
  },
  // Approving is just a status update to ACTIVE -- same endpoint, named
  // separately here for clarity at the call site.
  async approve(id: string) {
    return institutionStudentApi.update(id, { status: "ACTIVE" });
  },
  async reject(id: string) {
    await apiClient.delete(`/auth/institution-students/${id}`);
  },
  async remove(id: string) {
    await apiClient.delete(`/auth/institution-students/${id}`);
  },
};
