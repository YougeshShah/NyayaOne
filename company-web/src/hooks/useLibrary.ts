import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { libraryApi, LibraryResourceFormValues } from "../api/library.api";

export function useLibraryResources(params: { type?: string; category?: string; search?: string; page?: number }) {
  return useQuery({
    queryKey: ["library-resources", params],
    queryFn: () => libraryApi.list(params),
  });
}

export function useLibraryCategories() {
  return useQuery({ queryKey: ["library-categories"], queryFn: () => libraryApi.listCategories() });
}

export function useLibraryActions() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["library-resources"] });

  const create = useMutation({
    mutationFn: (values: LibraryResourceFormValues) => libraryApi.create(values),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => libraryApi.remove(id),
    onSuccess: invalidate,
  });

  return { create, remove };
}
