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
};
