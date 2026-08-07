import { prisma } from "../../../database/prisma";
import { Prisma, ExamType, Difficulty } from "@prisma/client";

export const mcqRepository = {
  async findMany(params: {
    courseId?: string;
    subjectId?: string;
    examType?: ExamType;
    difficulty?: Difficulty;
    skip: number;
    take: number;
  }) {
    const where: Prisma.McqQuestionWhereInput = {
      ...(params.courseId ? { courseId: params.courseId } : {}),
      ...(params.subjectId ? { subjectId: params.subjectId } : {}),
      ...(params.examType ? { examType: params.examType } : {}),
      ...(params.difficulty ? { difficulty: params.difficulty } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.mcqQuestion.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: "desc" },
        include: { subject: true },
      }),
      prisma.mcqQuestion.count({ where }),
    ]);

    return { items, total };
  },

  findById(id: string) {
    return prisma.mcqQuestion.findUnique({ where: { id }, include: { subject: true } });
  },

  create(data: Prisma.McqQuestionCreateInput) {
    return prisma.mcqQuestion.create({ data });
  },

  update(id: string, data: Prisma.McqQuestionUpdateInput) {
    return prisma.mcqQuestion.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.mcqQuestion.delete({ where: { id } });
  },

  /**
   * Random selection of N questions for a mock test — pulls matching
   * question ids and shuffles in JS. Fine at MVP scale (hundreds to low
   * thousands of questions per course); if the question bank grows much
   * larger, this is the one place to revisit for a database-level random
   * sample instead.
   */
  async findRandom(params: { courseId: string; subjectId?: string; examType?: ExamType; count: number }) {
    const where: Prisma.McqQuestionWhereInput = {
      courseId: params.courseId,
      ...(params.subjectId ? { subjectId: params.subjectId } : {}),
      ...(params.examType ? { examType: params.examType } : {}),
    };
    const all = await prisma.mcqQuestion.findMany({ where, select: { id: true } });
    const shuffled = all.sort(() => Math.random() - 0.5).slice(0, params.count);
    return shuffled.map((q: { id: string }) => q.id);
  },
};
