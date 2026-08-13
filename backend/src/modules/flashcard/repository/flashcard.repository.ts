import { prisma } from "../../../database/prisma";

export const flashcardRepository = {
  create(data: {
    term: string;
    definition: string;
    example?: string;
    courseId: string;
    subjectId?: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    createdBy: string;
    hostLawFirmId?: string;
  }) {
    return prisma.flashcard.create({ data: data as any });
  },

  update(id: string, data: Partial<{ term: string; definition: string; example: string; subjectId: string; difficulty: "EASY" | "MEDIUM" | "HARD" }>) {
    return prisma.flashcard.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.flashcard.delete({ where: { id } });
  },

  findById(id: string) {
    return prisma.flashcard.findUnique({ where: { id } });
  },

  // studentLawFirmId (when set) restricts to Company-wide cards (host null)
  // + this student's own institution's cards — same visibility rule as
  // McqQuestion. forLawFirmId restricts an institution admin's own
  // management view to only the cards their own institution created.
  findMany(params: { courseId: string; subjectId?: string; studentLawFirmId?: string | null; forLawFirmId?: string }) {
    return prisma.flashcard.findMany({
      where: {
        courseId: params.courseId,
        ...(params.subjectId ? { subjectId: params.subjectId } : {}),
        ...(params.forLawFirmId
          ? { hostLawFirmId: params.forLawFirmId }
          : params.studentLawFirmId !== undefined
          ? { OR: [{ hostLawFirmId: null }, { hostLawFirmId: params.studentLawFirmId }] }
          : {}),
      },
      orderBy: { createdAt: "desc" },
    });
  },

  upsertProgress(studentId: string, flashcardId: string, familiarity: "AGAIN" | "GOOD" | "EASY") {
    return prisma.flashcardProgress.upsert({
      where: { studentId_flashcardId: { studentId, flashcardId } },
      update: { familiarity, reviewedAt: new Date() },
      create: { studentId, flashcardId, familiarity },
    });
  },

  findProgressForStudent(studentId: string, courseId: string) {
    return prisma.flashcardProgress.findMany({
      where: { studentId, flashcard: { courseId } },
      select: { flashcardId: true, familiarity: true },
    });
  },
};
