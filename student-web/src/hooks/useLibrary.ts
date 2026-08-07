import { useQuery } from "@tanstack/react-query";
import { libraryApi } from "../api/library.api";

export function useLibraryResources(params: { courseId: string; subjectId?: string; type?: string; search?: string }) {
  return useQuery({
    queryKey: ["library-resources", params],
    queryFn: () => libraryApi.list(params),
    enabled: !!params.courseId,
  });
}
