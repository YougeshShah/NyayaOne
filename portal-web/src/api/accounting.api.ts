import { apiClient } from "./client";
import { ApiSuccessResponse } from "../types/api.types";

export const accountingApi = {
  async getSummary() {
    const { data } = await apiClient.get<ApiSuccessResponse<{ totalCollected: number; pendingCount: number; thisMonthCollected: number }>>(
      "/institution-fee/summary/institution"
    );
    return data.data;
  },

  // Search (for autocomplete dropdowns)
  async searchStudents(q: string) {
    const { data } = await apiClient.get<ApiSuccessResponse<{ id: string; fullName: string; email: string; phone: string | null }[]>>(
      "/institution-fee/search-students",
      { params: { q } }
    );
    return data.data;
  },
  async searchStaff(q: string) {
    const { data } = await apiClient.get<ApiSuccessResponse<{ id: string; fullName: string; email: string; phone: string | null }[]>>(
      "/staff-payroll/search-staff",
      { params: { q } }
    );
    return data.data;
  },

  // Fee
  async getFee(courseId: string) {
    const { data } = await apiClient.get<ApiSuccessResponse<any>>(`/institution-fee/fee/institution/${courseId}`);
    return data.data;
  },
  async setFee(courseId: string, amount: number) {
    const { data } = await apiClient.put<ApiSuccessResponse<any>>("/institution-fee/fee/institution", { courseId, amount });
    return data.data;
  },

  // Discounts
  async listDiscounts(courseId: string) {
    const { data } = await apiClient.get<ApiSuccessResponse<any[]>>(`/institution-fee/discounts/${courseId}`);
    return data.data;
  },
  async grantDiscount(payload: { studentId: string; courseId: string; type: "PERCENTAGE" | "FIXED_AMOUNT"; value: number; reason?: string }) {
    const { data } = await apiClient.put<ApiSuccessResponse<any>>("/institution-fee/discounts", payload);
    return data.data;
  },
  async removeDiscount(studentId: string, courseId: string) {
    await apiClient.delete(`/institution-fee/discounts/${studentId}/${courseId}`);
  },

  // QR code
  async getMyQrCode() {
    const { data } = await apiClient.get<ApiSuccessResponse<{ paymentQrCodeUrl: string | null }>>("/institution-fee/qr-code/my");
    return data.data;
  },
  async uploadQrCode(file: File) {
    const formData = new FormData();
    formData.append("qrCode", file);
    const { data } = await apiClient.post<ApiSuccessResponse<any>>("/institution-fee/qr-code", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data;
  },

  // Manual payment
  async recordManualPayment(payload: { studentId: string; courseId: string; amount: number; paymentMethod: string; receiptNumber?: string }) {
    const { data } = await apiClient.post<ApiSuccessResponse<any>>("/institution-fee/manual-payment", payload);
    return data.data;
  },

  // Transactions
  async listTransactions(search?: string) {
    const { data } = await apiClient.get<ApiSuccessResponse<any[]>>("/institution-fee/transactions/institution", { params: { search } });
    return data.data;
  },
  async exportTransactionsUrl(search?: string) {
    const params = search ? `?search=${encodeURIComponent(search)}` : "";
    return `${apiClient.defaults.baseURL}/institution-fee/transactions/institution/export${params}`;
  },

  // Staff payroll
  async setStaffSalary(payload: { staffId: string; category: string; salaryType: string; amount: number }) {
    const { data } = await apiClient.put<ApiSuccessResponse<any>>("/staff-payroll/salary", payload);
    return data.data;
  },
  async listStaffSalaries(category?: string) {
    const { data } = await apiClient.get<ApiSuccessResponse<any[]>>("/staff-payroll/salary", { params: { category } });
    return data.data;
  },
  async recordStaffPayment(payload: { staffId: string; amount: number; paidForPeriod?: string; paymentMethod: string; receiptNumber?: string }) {
    const { data } = await apiClient.post<ApiSuccessResponse<any>>("/staff-payroll/payment", payload);
    return data.data;
  },
  async listStaffPayments(search?: string) {
    const { data } = await apiClient.get<ApiSuccessResponse<any[]>>("/staff-payroll/payments", { params: { search } });
    return data.data;
  },
  async exportStaffPaymentsUrl(search?: string) {
    const params = search ? `?search=${encodeURIComponent(search)}` : "";
    return `${apiClient.defaults.baseURL}/staff-payroll/payments/export${params}`;
  },
};
