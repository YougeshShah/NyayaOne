import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { lawFirmApi, CreateLawFirmPayload } from "../api/lawfirm.api";
import { LawFirmStatus } from "../types/lawfirm.types";

export function useLawFirms(params: { status?: LawFirmStatus; search?: string; page?: number }) {
  return useQuery({
    queryKey: ["law-firms", params],
    queryFn: () => lawFirmApi.list(params),
  });
}

export function useLawFirmDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["law-firm", id],
    queryFn: () => lawFirmApi.getById(id as string),
    enabled: !!id,
  });
}

export function useLawFirmActions() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["law-firms"] });
    queryClient.invalidateQueries({ queryKey: ["law-firm"] });
  };

  const approve = useMutation({
    mutationFn: (id: string) => lawFirmApi.approve(id),
    onSuccess: invalidate,
  });

  const suspend = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => lawFirmApi.suspend(id, reason),
    onSuccess: invalidate,
  });

  const activate = useMutation({
    mutationFn: (id: string) => lawFirmApi.activate(id),
    onSuccess: invalidate,
  });

  const reject = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => lawFirmApi.reject(id, reason),
    onSuccess: invalidate,
  });

  const create = useMutation({
    mutationFn: (payload: CreateLawFirmPayload) => lawFirmApi.create(payload),
    onSuccess: invalidate,
  });

  return { approve, suspend, activate, reject, create };
}
