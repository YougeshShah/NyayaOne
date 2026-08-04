import { useMutation, useQuery } from "@tanstack/react-query";
import { libraryApi } from "../api/library.api";
import { LibraryResourceType } from "../types/library.types";

export function useLibraryResources(params: { type?: LibraryResourceType; category?: string; isRepealed?: boolean; search?: string; page?: number }) {
  return useQuery({ queryKey: ["library", params], queryFn: () => libraryApi.list(params) });
}

export function useLibraryCategories() {
  return useQuery({ queryKey: ["library-categories"], queryFn: () => libraryApi.listCategories() });
}

export function useDownloadLibraryResource() {
  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => libraryApi.download(id, title),
  });
}
