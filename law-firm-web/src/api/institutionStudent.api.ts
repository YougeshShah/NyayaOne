import { apiClient } from "./client";
import { ApiSuccessResponse } from "../types/api.types";

export interface InstitutionStudent {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  createdAt: string;
}

export interface AddStudentPayload {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
}

export const institutionStudentApi = {
  async list(): Promise<InstitutionStudent[]> {
    const { data } = await apiClient.get<ApiSuccessResponse<InstitutionStudent[]>>("/auth/institution-students");
    return data.data;
  },

  async add(payload: AddStudentPayload) {
    const { data } = await apiClient.post<ApiSuccessResponse<any>>("/auth/institution-students", payload);
    return data.data;
  },
};
