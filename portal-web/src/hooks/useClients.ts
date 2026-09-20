import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "../api/client.api";
import { CreateClientPayload } from "../types/client.types";

export function useClients(params: { search?: string; page?: number }) {
  return useQuery({
    queryKey: ["clients", params],
    queryFn: () => clientApi.list(params),
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateClientPayload) => clientApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clients"] }),
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateClientPayload> }) => clientApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clients"] }),
  });
}

export function useInviteClient() {
  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) => clientApi.invite(id, password),
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clientApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clients"] }),
  });
}
