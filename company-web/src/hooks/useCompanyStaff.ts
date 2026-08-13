import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { companyStaffApi } from "../api/companyStaff.api";
import { CreateCompanyStaffPayload } from "../types/companyStaff.types";

export function useCompanyStaff(params: { search?: string; page?: number }) {
  return useQuery({ queryKey: ["company-staff", params], queryFn: () => companyStaffApi.list(params) });
}

export function useRoles() {
  return useQuery({ queryKey: ["roles"], queryFn: () => companyStaffApi.listRoles() });
}

export function useCompanyStaffActions() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["company-staff"] });

  const create = useMutation({
    mutationFn: (payload: CreateCompanyStaffPayload) => companyStaffApi.create(payload),
    onSuccess: invalidate,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => companyStaffApi.updateStatus(id, status),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { fullName?: string; phone?: string } }) => companyStaffApi.update(id, payload),
    onSuccess: invalidate,
  });

  const resetPassword = useMutation({
    mutationFn: (id: string) => companyStaffApi.resetPassword(id),
  });

  const updateRole = useMutation({
    mutationFn: ({ id, roleId }: { id: string; roleId: string }) => companyStaffApi.updateRole(id, roleId),
    onSuccess: invalidate,
  });

  return { create, updateStatus, update, resetPassword, updateRole };
}
