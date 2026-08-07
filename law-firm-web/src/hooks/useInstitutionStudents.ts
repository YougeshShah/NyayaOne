import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { institutionStudentApi, AddStudentPayload } from "../api/institutionStudent.api";

export function useInstitutionStudents() {
  return useQuery({ queryKey: ["institution-students"], queryFn: () => institutionStudentApi.list() });
}

export function useAddInstitutionStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddStudentPayload) => institutionStudentApi.add(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["institution-students"] }),
  });
}
