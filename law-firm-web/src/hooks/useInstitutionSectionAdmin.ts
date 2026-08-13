import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { institutionTestSectionApi, CreateSectionPayload } from "../api/institutionTestSection.api";

export function useInstitutionSectionsAdmin(mockTestId: string) {
  return useQuery({
    queryKey: ["institution-sections-admin", mockTestId],
    queryFn: () => institutionTestSectionApi.list(mockTestId),
    enabled: !!mockTestId,
  });
}

export function useInstitutionSectionAdminActions() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["institution-sections-admin"] });

  const create = useMutation({
    mutationFn: (payload: CreateSectionPayload) => institutionTestSectionApi.create(payload),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: string) => institutionTestSectionApi.remove(id),
    onSuccess: invalidate,
  });

  return { create, remove };
}
