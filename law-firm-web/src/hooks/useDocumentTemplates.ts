import { useMutation, useQuery } from "@tanstack/react-query";
import { documentTemplateApi } from "../api/documentTemplate.api";

export function useDocumentTemplates() {
  return useQuery({ queryKey: ["document-templates"], queryFn: () => documentTemplateApi.list() });
}

export function useGenerateDocument() {
  return useMutation({
    mutationFn: ({ templateId, caseId, clientId }: { templateId: string; caseId: string; clientId?: string }) =>
      documentTemplateApi.generate(templateId, caseId, clientId),
    onSuccess: ({ blob, fileName }) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
  });
}
