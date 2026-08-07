import { apiClient } from "./client";
import { ApiSuccessResponse } from "../types/api.types";

export interface EsewaInitiateResult {
  formUrl: string;
  fields: Record<string, string | number>;
}

export const paymentApi = {
  async initiateEsewa(courseId: string, amount: number): Promise<EsewaInitiateResult> {
    const { data } = await apiClient.post<ApiSuccessResponse<EsewaInitiateResult>>("/payment/esewa/initiate", {
      courseId,
      amount,
    });
    return data.data;
  },

  async verifyEsewa(encodedData: string) {
    const { data } = await apiClient.post<ApiSuccessResponse<{ message: string }>>("/payment/esewa/verify", {
      data: encodedData,
    });
    return data.data;
  },

  async initiateKhalti(courseId: string, amount: number): Promise<{ paymentUrl: string }> {
    const { data } = await apiClient.post<ApiSuccessResponse<{ paymentUrl: string }>>("/payment/khalti/initiate", {
      courseId,
      amount,
    });
    return data.data;
  },

  async verifyKhalti(pidx: string) {
    const { data } = await apiClient.post<ApiSuccessResponse<{ message: string }>>("/payment/khalti/verify", { pidx });
    return data.data;
  },
};
