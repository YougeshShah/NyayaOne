import { apiClient } from "./client";

async function downloadBlob(url: string, params: Record<string, string | undefined>, fallbackFileName: string) {
  const response = await apiClient.get(url, { params, responseType: "blob" });
  const disposition = response.headers["content-disposition"] as string | undefined;
  const match = disposition?.match(/filename="(.+)"/);
  const fileName = match?.[1] || fallbackFileName;
  const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
}
export const reportApi = {
  downloadCases: (format: "excel" | "pdf", status?: string) =>
    downloadBlob("/reports/cases", { format, status }, `cases-report.${format === "pdf" ? "pdf" : "xlsx"}`),
  downloadHearings: (format: "excel" | "pdf") =>
    downloadBlob("/reports/hearings", { format }, `hearings-report.${format === "pdf" ? "pdf" : "xlsx"}`),
  downloadClients: () => downloadBlob("/reports/clients", {}, "clients-report.xlsx"),

  // JSON list variants -- same filters as the downloads, used for the
  // "View List" preview instead of generating a file.
  async listCases(status?: string): Promise<any[]> {
    const { data } = await apiClient.get("/reports/cases/list", { params: { status } });
    return data.data.items;
  },
  async listHearings(): Promise<any[]> {
    const { data } = await apiClient.get("/reports/hearings/list");
    return data.data.items;
  },
  async listClients(): Promise<any[]> {
    const { data } = await apiClient.get("/reports/clients/list");
    return data.data.items;
  },
};
