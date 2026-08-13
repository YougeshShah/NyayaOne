import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { institutionFlashcardApi, CreateFlashcardPayload } from "../api/institutionFlashcard.api";

export function useInstitutionFlashcards(courseId: string, subjectId?: string) {
  return useQuery({
    queryKey: ["institution-flashcards", courseId, subjectId],
    queryFn: () => institutionFlashcardApi.list(courseId, subjectId),
    enabled: !!courseId,
  });
}

export function useInstitutionFlashcardActions() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["institution-flashcards"] });

  const create = useMutation({
    mutationFn: (payload: CreateFlashcardPayload) => institutionFlashcardApi.create(payload),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateFlashcardPayload> }) => institutionFlashcardApi.update(id, payload),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: string) => institutionFlashcardApi.remove(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
