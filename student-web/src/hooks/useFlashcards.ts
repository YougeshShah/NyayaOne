import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { flashcardApi } from "../api/flashcard.api";

export function useFlashcards(courseId: string, subjectId?: string) {
  return useQuery({
    queryKey: ["flashcards", courseId, subjectId],
    queryFn: () => flashcardApi.list(courseId, subjectId),
    enabled: !!courseId,
  });
}

export function useSubmitFamiliarity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, familiarity }: { id: string; familiarity: "AGAIN" | "GOOD" | "EASY" }) => flashcardApi.submitFamiliarity(id, familiarity),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["flashcards"] }),
  });
}
