import { prisma } from "../../../database/prisma";
import { ExamType } from "@prisma/client";

export const subjectRepository = {
  findMany(params: { courseId?: string; examType?: ExamType }) {
    return prisma.subject.findMany({
      where: {
        ...(params.courseId ? { courseId: params.courseId } : {}),
        ...(params.examType ? { examType: params.examType } : {}),
      },
      include: { course: true },
      orderBy: { name: "asc" },
    });
  },

  findById(id: string) {
    return prisma.subject.findUnique({ where: { id }, include: { course: true } });
  },

  findByNameAndCourse(name: string, courseId: string) {
    return prisma.subject.findFirst({ where: { name, courseId } });
  },

  create(data: { name: string; courseId: string; examType?: ExamType }) {
    return prisma.subject.create({
      data: {
        name: data.name,
        examType: data.examType,
        course: { connect: { id: data.courseId } },
      },
    });
  },

  delete(id: string) {
    return prisma.subject.delete({ where: { id } });
  },
};
