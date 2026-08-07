import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { testSectionAdminApi, CreateSectionPayload } from "../api/testSectionAdmin.api";

export function useSectionsAdmin(mockTestId: string) {
  return useQuery({ queryKey: ["sections-admin", mockTestId], queryFn: () => testSectionAdminApi.list(mockTestId), enabled: !!mockTestId });
}

export function useSectionAdminActions() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["sections-admin"] });

  const create = useMutation({
    mutationFn: (payload: CreateSectionPayload) => testSectionAdminApi.create(payload),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: string) => testSectionAdminApi.remove(id),
    onSuccess: invalidate,
  });

  return { create, remove };
}
