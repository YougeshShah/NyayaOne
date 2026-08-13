import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { institutionMockTestApi, CreateMockTestPayload } from "../api/institutionMockTest.api";

export function useInstitutionMockTestsAdmin(courseId?: string) {
  return useQuery({
    queryKey: ["institution-mock-tests-admin", courseId],
    queryFn: () => institutionMockTestApi.list(courseId),
    enabled: !!courseId,
  });
}

export function useInstitutionMockTestAdminActions() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["institution-mock-tests-admin"] });

  const create = useMutation({
    mutationFn: (payload: CreateMockTestPayload) => institutionMockTestApi.create(payload),
    onSuccess: invalidate,
  });
  const publish = useMutation({
    mutationFn: (id: string) => institutionMockTestApi.publish(id),
    onSuccess: invalidate,
  });

  return { create, publish };
}
