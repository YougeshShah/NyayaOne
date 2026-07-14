import { useQuery } from "@tanstack/react-query";
import { courtApi } from "../api/court.api";

export function useCourtsList(search?: string) {
  return useQuery({
    queryKey: ["courts-reference", search],
    queryFn: () => courtApi.list({ search, limit: 200 }),
  });
}
