import { useMutation, useQuery } from "@tanstack/react-query";
import { Paths, File, DownloadTask } from "expo-file-system";
import * as Sharing from "expo-sharing";
import Constants from "expo-constants";
import { documentTemplateApi } from "../api/documentTemplate.api";
import { useAuthStore } from "../store/authStore";

export function useDocumentTemplates() {
  return useQuery({ queryKey: ["document-templates"], queryFn: () => documentTemplateApi.list() });
}

export function useDocumentTemplateDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["document-template", id],
    queryFn: () => documentTemplateApi.getById(id as string),
    enabled: !!id,
  });
}

const API_BASE_URL = (Constants.expoConfig?.extra?.apiBaseUrl as string) || "http://localhost:5000/api/v1";

export function useGenerateDocument() {
  return useMutation({
    mutationFn: async ({
      templateId,
      caseId,
      values,
      clientId,
    }: {
      templateId: string;
      caseId: string;
      values: Record<string, string>;
      clientId?: string;
    }) => {
      const token = useAuthStore.getState().accessToken;
      const destination = new File(Paths.cache, `document-${Date.now()}.pdf`);

      // The generate endpoint is a POST with a JSON body, not a simple GET —
      // DownloadTask doesn't support a request body, so this uses a plain
      // fetch() to get the PDF bytes, then writes them to disk manually.
      const response = await fetch(`${API_BASE_URL}/document-templates/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ templateId, caseId, clientId, values }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || "Failed to generate document");
      }

      const arrayBuffer = await response.arrayBuffer();
      destination.write(new Uint8Array(arrayBuffer));

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) await Sharing.shareAsync(destination.uri);

      return destination.uri;
    },
  });
}
