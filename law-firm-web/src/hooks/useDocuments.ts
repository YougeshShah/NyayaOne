import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { documentApi } from "../api/document.api";
import { DocumentCategory } from "../types/document.types";

export function useCaseDocuments(caseId: string | undefined) {
  return useQuery({
    queryKey: ["documents", caseId],
    queryFn: () => documentApi.list({ caseId, limit: 100 }),
    enabled: !!caseId,
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, caseId, category }: { file: File; caseId: string; category: DocumentCategory }) =>
      documentApi.upload(file, caseId, category),
    onSuccess: (_, variables) => queryClient.invalidateQueries({ queryKey: ["documents", variables.caseId] }),
  });
}

export function useDeleteDocument(caseId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => documentApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents", caseId] }),
  });
}

export function useDownloadDocument() {
  return useMutation({
    mutationFn: ({ id, fileName }: { id: string; fileName: string }) => documentApi.download(id, fileName),
  });
}
