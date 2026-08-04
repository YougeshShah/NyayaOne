import { useMutation, useQuery } from "@tanstack/react-query";
import { documentTemplateApi } from "../api/documentTemplate.api";

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

export function useGenerateDocument() {
  return useMutation({
    mutationFn: ({
      templateId,
      caseId,
      values,
      clientId,
    }: {
      templateId: string;
      caseId: string;
      values: Record<string, string>;
      clientId?: string;
    }) => documentTemplateApi.generate(templateId, caseId, values, clientId),
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
