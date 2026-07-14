import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../api/user.api";
import { CreateFirmUserPayload, StaffAccountType, UserStatus } from "../types/user.types";

export function useFirmUsers(params: { accountType?: StaffAccountType; status?: UserStatus; search?: string }) {
  return useQuery({
    queryKey: ["firm-users", params],
    queryFn: () => userApi.list(params),
  });
}

export function useFirmUserActions() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["firm-users"] });

  const create = useMutation({
    mutationFn: (payload: CreateFirmUserPayload) => userApi.create(payload),
    onSuccess: invalidate,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: UserStatus }) => userApi.updateStatus(id, status),
    onSuccess: invalidate,
  });

  return { create, updateStatus };
}
