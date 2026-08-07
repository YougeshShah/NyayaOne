import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bookmarkApi } from "../api/bookmark.api";

export function useBookmarks() {
  return useQuery({ queryKey: ["bookmarks"], queryFn: () => bookmarkApi.list() });
}

export function useToggleBookmark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ resourceType, resourceId }: { resourceType: "LIBRARY" | "MCQ"; resourceId: string }) =>
      bookmarkApi.toggle(resourceType, resourceId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookmarks"] }),
  });
}
