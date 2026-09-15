import { prisma } from "../../../database/prisma";

export const studentNoteRepository = {
  create(data: { studentId: string; courseId?: string; title: string; content: string }) {
    return prisma.studentNote.create({ data });
  },

  findById(id: string) {
    return prisma.studentNote.findUnique({ where: { id } });
  },

  listForStudent(studentId: string, courseId?: string) {
    return prisma.studentNote.findMany({
      where: { studentId, ...(courseId ? { courseId } : {}) },
      orderBy: { updatedAt: "desc" },
    });
  },

  update(id: string, data: { title?: string; content?: string }) {
    return prisma.studentNote.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.studentNote.delete({ where: { id } });
  },
};
