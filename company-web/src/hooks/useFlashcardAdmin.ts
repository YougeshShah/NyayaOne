import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { flashcardAdminApi, CreateFlashcardPayload } from "../api/flashcardAdmin.api";

export function useFlashcardsAdmin(courseId: string, subjectId?: string) {
  return useQuery({
    queryKey: ["flashcards-admin", courseId, subjectId],
    queryFn: () => flashcardAdminApi.list(courseId, subjectId),
    enabled: !!courseId,
  });
}

export function useFlashcardAdminActions() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["flashcards-admin"] });

  const create = useMutation({
    mutationFn: (payload: CreateFlashcardPayload) => flashcardAdminApi.create(payload),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateFlashcardPayload> }) => flashcardAdminApi.update(id, payload),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: string) => flashcardAdminApi.remove(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
