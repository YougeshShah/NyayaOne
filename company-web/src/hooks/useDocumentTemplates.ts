import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { documentTemplateApi, CreateTemplatePayload } from "../api/documentTemplate.api";

export function useDocumentTemplates() {
  return useQuery({ queryKey: ["document-templates"], queryFn: () => documentTemplateApi.list() });
}

export function useAutofillSources() {
  return useQuery({ queryKey: ["autofill-sources"], queryFn: () => documentTemplateApi.autofillSources() });
}

export function useDocumentTemplateActions() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["document-templates"] });

  const create = useMutation({
    mutationFn: (payload: CreateTemplatePayload) => documentTemplateApi.create(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateTemplatePayload> & { isActive?: boolean } }) =>
      documentTemplateApi.update(id, payload),
    onSuccess: invalidate,
  });

  const analyzeSample = useMutation({
    mutationFn: (text: string) => documentTemplateApi.analyzeSample(text),
  });

  return { create, update, analyzeSample };
}
