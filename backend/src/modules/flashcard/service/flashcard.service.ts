import { AppError } from "../../../common/errors/AppError";
import { flashcardRepository } from "../repository/flashcard.repository";
import { CreateFlashcardInput, UpdateFlashcardInput } from "../dto/flashcard.dto";
import { lawFirmRepository } from "../../lawfirm/repository/lawfirm.repository";

export const flashcardService = {
  async create(input: CreateFlashcardInput, createdBy: string, hostLawFirmId?: string) {
    // Same "Sector Access" check as Mock Test -- an institution can only
    // add content to courses Company has specifically granted it (e.g. an
    // IELTS-only institute can't add Law flashcards even though the
    // student_platform module is enabled for them generally).
    if (hostLawFirmId) {
      const firm = await lawFirmRepository.findById(hostLawFirmId);
      const allowed = (firm as any)?.allowedCourseIds ?? [];
      if (allowed.length > 0 && !allowed.includes((input as any).courseId)) {
        throw AppError.forbidden("Your institution doesn't have Sector Access to this course.");
      }
    }
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
