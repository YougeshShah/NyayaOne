import { prisma } from "../../../database/prisma";

export const courseContentRepository = {
  create(data: {
    courseId: string;
    subjectId?: string;
    lawFirmId: string | null;
    term: string;
    title: string;
    fileType: "PDF" | "IMAGE" | "TEXT";
    fileUrl?: string;
    textBody?: string;
    uploadedBy: string;
  }) {
    return prisma.courseContent.create({ data });
  },

  findById(id: string) {
    return prisma.courseContent.findUnique({ where: { id } });
  },

  // Students see: Company's own content (lawFirmId null) PLUS their own
  // institution's content (lawFirmId = their institution) -- never another
  // institution's content.
  listForStudent(courseId: string, studentLawFirmId: string | null, subjectId?: string, term?: string) {
    return prisma.courseContent.findMany({
      where: {
        courseId,
        OR: [{ lawFirmId: null }, ...(studentLawFirmId ? [{ lawFirmId: studentLawFirmId }] : [])],
        ...(subjectId ? { subjectId } : {}),
        ...(term ? { term } : {}),
      },
      include: { subject: { select: { id: true, name: true } } },
      orderBy: [{ term: "asc" }, { createdAt: "asc" }],
    });
  },

  // Admin view: Company sees only its own (lawFirmId null); institution
  // sees only its own (lawFirmId = its id) -- each manages independently.
  listForAdmin(courseId: string, lawFirmId: string | null) {
    return prisma.courseContent.findMany({
      where: { courseId, lawFirmId },
      include: { subject: { select: { id: true, name: true } } },
      orderBy: [{ term: "asc" }, { createdAt: "asc" }],
    });
  },

  update(id: string, data: { term?: string; title?: string; textBody?: string }) {
    return prisma.courseContent.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.courseContent.delete({ where: { id } });
  },
};
