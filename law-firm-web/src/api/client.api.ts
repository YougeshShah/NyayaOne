import { apiClient } from "./client";
import { ApiSuccessResponse, PaginatedResult } from "../types/api.types";
import { Client, CreateClientPayload } from "../types/client.types";

export const clientApi = {
  async list(params: { search?: string; page?: number; limit?: number }) {
    const { data } = await apiClient.get<ApiSuccessResponse<PaginatedResult<Client>>>("/clients", { params });
    return data.data;
  },

  async getById(id: string): Promise<Client> {
    const { data } = await apiClient.get<ApiSuccessResponse<Client>>(`/clients/${id}`);
    return data.data;
  },

  async create(payload: CreateClientPayload): Promise<Client> {
    const { data } = await apiClient.post<ApiSuccessResponse<Client>>("/clients", payload);
    return data.data;
  },

  async update(id: string, payload: Partial<CreateClientPayload>): Promise<Client> {
    const { data } = await apiClient.patch<ApiSuccessResponse<Client>>(`/clients/${id}`, payload);
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/clients/${id}`);
  },

  async invite(id: string, password: string): Promise<{ message: string }> {
    const { data } = await apiClient.post<{ success: true; message: string }>(`/clients/${id}/invite`, { password });
    return data;
  },
};
