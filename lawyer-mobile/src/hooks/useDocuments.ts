import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { documentApi, DocumentCategory } from "../api/document.api";
import { downloadAndShareDocument } from "../utils/downloadDocument";

export function useCaseDocuments(caseId: string | undefined) {
  return useQuery({
    queryKey: ["case-documents", caseId],
    queryFn: () => documentApi.listForCase(caseId as string),
    enabled: !!caseId,
  });
}

export function useUploadDocument(caseId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ category, file }: { category: DocumentCategory; file: { uri: string; name: string; mimeType: string } }) =>
      documentApi.upload(caseId as string, category, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["case-documents", caseId] }),
  });
}

export function useDeleteCaseDocument(caseId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => documentApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["case-documents", caseId] }),
  });
}

export function useDownloadCaseDocument() {
  return useMutation({
    mutationFn: ({ id, fileName }: { id: string; fileName: string }) => downloadAndShareDocument(id, fileName),
  });
}
