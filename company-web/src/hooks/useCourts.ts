import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { courtApi } from "../api/court.api";
import { CreateCourtPayload } from "../types/court.types";

export function useCourts(params: { type?: string; province?: string; search?: string; isActive?: boolean; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["courts", params],
    queryFn: () => courtApi.list(params),
  });
}

export function useCourtProvinces() {
  return useQuery({
    queryKey: ["court-provinces"],
    queryFn: () => courtApi.listProvinces(),
  });
}

export function useCourtTypes() {
  return useQuery({
    queryKey: ["court-types"],
    queryFn: () => courtApi.listTypes(),
  });
}

export function useCourtActions() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["courts"] });

  const create = useMutation({
    mutationFn: (payload: CreateCourtPayload) => courtApi.create(payload),
    onSuccess: invalidate,
  });

  const deactivate = useMutation({
    mutationFn: (id: string) => courtApi.deactivate(id),
    onSuccess: invalidate,
  });

  const activate = useMutation({
    mutationFn: (id: string) => courtApi.activate(id),
    onSuccess: invalidate,
  });

  return { create, deactivate, activate };
}
