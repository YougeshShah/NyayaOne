import { prisma } from "../../../database/prisma";
import { ExamType } from "@prisma/client";

export const mockTestRepository = {
  findMany(params: {
    courseId?: string;
    examType?: ExamType;
    publishedOnly: boolean;
    studentLawFirmId?: string | null;
    forLawFirmId?: string;
    studentExamType?: string | null;
  }) {
    return prisma.mockTest.findMany({
      where: {
        ...(params.courseId ? { courseId: params.courseId } : {}),
        ...(params.examType ? { examType: params.examType } : {}),
        ...(params.publishedOnly ? { isPublished: true } : {}),
        AND: [
          params.forLawFirmId
            ? { hostLawFirmId: params.forLawFirmId } // Institution staff view — only their own tests
            : params.studentLawFirmId !== undefined
            ? { OR: [{ hostLawFirmId: null }, { hostLawFirmId: params.studentLawFirmId }] } // Student view
            : {},
          // Same level-scoping rule as MCQ questions — a Kharidar student
          // sees general (untagged) tests plus their own level's tests only.
          params.studentExamType ? { OR: [{ examType: null }, { examType: params.studentExamType as any }] } : {},
        ],
      },
      include: { subject: true, _count: { select: { questions: true } } },
      orderBy: { createdAt: "desc" },
    });
  },

  findById(id: string) {
    return prisma.mockTest.findUnique({
      where: { id },
      include: {
        subject: true,
        questions: { include: { question: true }, orderBy: { order: "asc" } },
        sections: { orderBy: { order: "asc" }, include: { mockTestQuestions: { include: { question: true }, orderBy: { order: "asc" } } } },
      },
    });
  },

  create(data: {
    title: string;
    courseId: string;
    examType?: ExamType;
    subjectId?: string;
    durationMinutes: number;
    negativeMarkingPercent?: number;
    hostLawFirmId?: string;
    createdBy: string;
  }) {
    return prisma.mockTest.create({
      data: {
        title: data.title,
        courseId: data.courseId,
        examType: data.examType,
        subjectId: data.subjectId,
        durationMinutes: data.durationMinutes,
        negativeMarkingPercent: data.negativeMarkingPercent ?? 0,
        hostLawFirmId: data.hostLawFirmId,
        createdBy: data.createdBy,
      },
    });
  },

  addQuestions(mockTestId: string, questionIds: string[], marksPerQuestion = 1) {
    return prisma.mockTestQuestion.createMany({
      data: questionIds.map((questionId, index) => ({ mockTestId, questionId, order: index, marks: marksPerQuestion })),
    });
  },

  addSingleQuestion(mockTestId: string, questionId: string, marks: number, order: number) {
    return prisma.mockTestQuestion.upsert({
      where: { mockTestId_questionId: { mockTestId, questionId } },
      update: { marks },
      create: { mockTestId, questionId, marks, order },
    });
  },

  removeQuestion(mockTestId: string, questionId: string) {
    return prisma.mockTestQuestion.deleteMany({ where: { mockTestId, questionId } });
  },

  publish(id: string) {
    return prisma.mockTest.update({ where: { id }, data: { isPublished: true } });
  },

  // --- Attempts ---

  createAttempt(studentId: string, mockTestId: string, totalQuestions: number) {
    return prisma.testAttempt.create({
      data: { studentId, mockTestId, totalQuestions },
    });
  },

  findAttemptById(id: string) {
    return prisma.testAttempt.findUnique({
      where: { id },
      include: { answers: { include: { question: true } }, mockTest: true },
    });
  },

  findAttemptsByStudent(studentId: string) {
    return prisma.testAttempt.findMany({
      where: { studentId },
      include: { mockTest: true },
      orderBy: { startedAt: "desc" },
    });
  },

  saveAnswers(attemptId: string, answers: { questionId: string; selectedOption: string | null; isCorrect: boolean | null }[]) {
    return prisma.testAnswer.createMany({
      data: answers.map((a) => ({ attemptId, ...a })),
    });
  },

  submitAttempt(attemptId: string, score: number) {
    return prisma.testAttempt.update({
      where: { id: attemptId },
      data: { submittedAt: new Date(), score },
    });
  },
};
