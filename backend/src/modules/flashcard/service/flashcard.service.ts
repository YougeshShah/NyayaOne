import { AppError } from "../../../common/errors/AppError";
import { flashcardRepository } from "../repository/flashcard.repository";
import { CreateFlashcardInput, UpdateFlashcardInput } from "../dto/flashcard.dto";

export const flashcardService = {
  async create(input: CreateFlashcardInput, createdBy: string, hostLawFirmId?: string) {
    return flashcardRepository.create({ ...input, createdBy, hostLawFirmId });
  },

  async update(id: string, input: UpdateFlashcardInput, requesterLawFirmId?: string) {
    const existing = await flashcardRepository.findById(id);
    if (!existing) throw AppError.notFound("Flashcard not found");
    if (requesterLawFirmId !== undefined && (existing as any).hostLawFirmId !== requesterLawFirmId) {
      throw AppError.forbidden("You can only edit your own institution's flashcards.");
    }
    return flashcardRepository.update(id, input);
  },

  async remove(id: string, requesterLawFirmId?: string) {
    const existing = await flashcardRepository.findById(id);
    if (!existing) throw AppError.notFound("Flashcard not found");
    if (requesterLawFirmId !== undefined && (existing as any).hostLawFirmId !== requesterLawFirmId) {
      throw AppError.forbidden("You can only delete your own institution's flashcards.");
    }
    await flashcardRepository.delete(id);
  },

  async list(params: { courseId: string; subjectId?: string; studentLawFirmId?: string | null; forLawFirmId?: string }) {
    return flashcardRepository.findMany(params);
  },

  async listForStudent(studentId: string, courseId: string, subjectId: string | undefined, studentLawFirmId: string | null) {
    const [cards, progress] = await Promise.all([
      flashcardRepository.findMany({ courseId, subjectId, studentLawFirmId }),
      flashcardRepository.findProgressForStudent(studentId, courseId),
    ]);
    const progressMap = new Map(progress.map((p) => [p.flashcardId, p.familiarity]));
    // "Again" and never-reviewed cards surface first — a simple ordering
    // that approximates spaced repetition without a background scheduler:
    // known ("Easy") cards drift toward the end of the deck automatically.
    const weight = { AGAIN: 0, GOOD: 1, EASY: 2 } as const;
    return cards
      .map((c) => ({ ...c, familiarity: progressMap.get(c.id) ?? null }))
      .sort((a, b) => (a.familiarity ? weight[a.familiarity] : -1) - (b.familiarity ? weight[b.familiarity] : -1));
  },

  async submitFamiliarity(studentId: string, flashcardId: string, familiarity: "AGAIN" | "GOOD" | "EASY") {
    return flashcardRepository.upsertProgress(studentId, flashcardId, familiarity);
  },
};
