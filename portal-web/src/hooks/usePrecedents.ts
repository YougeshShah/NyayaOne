import { useQuery } from "@tanstack/react-query";
import { precedentApi } from "../api/precedent.api";

export function usePrecedentSearch(params: { search?: string; category?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["precedents", params],
    queryFn: () => precedentApi.search(params),
    // Keep the previous page's results visible while a new search/page
    // loads, instead of flashing an empty state -- makes typing in the
    // search box feel responsive rather than jumpy.
    placeholderData: (prev) => prev,
  });
}

export function usePrecedentDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["precedent-detail", id],
    queryFn: () => precedentApi.getById(id as string),
    enabled: !!id,
  });
}

export function usePrecedentCategories() {
  return useQuery({ queryKey: ["precedent-categories"], queryFn: () => precedentApi.listCategories() });
}
