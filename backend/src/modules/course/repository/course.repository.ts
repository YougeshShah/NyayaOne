import { prisma } from "../../../database/prisma";
import { CourseCategory, Prisma } from "@prisma/client";

export const courseRepository = {
  findMany(activeOnly: boolean) {
    return prisma.course.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { name: "asc" },
      include: { _count: { select: { subjects: true, liveClasses: true, subscriptions: true, mcqQuestions: true } } },
    });
  },

  findById(id: string) {
    return prisma.course.findUnique({ where: { id } });
  },

  findByName(name: string) {
    return prisma.course.findFirst({ where: { name } });
  },

  create(data: { name: string; category: CourseCategory; description?: string; iconUrl?: string }) {
    return prisma.course.create({ data });
  },

  update(id: string, data: Prisma.CourseUpdateInput) {
    return prisma.course.update({ where: { id }, data });
  },

  // A student's subscription status for a specific course — used everywhere
  // access needs to be gated (MCQ list, mock test detail, live class join).
  findActiveSubscription(studentId: string, courseId: string) {
    return prisma.courseSubscription.findFirst({
      where: {
        studentId,
        courseId,
        status: "ACTIVE",
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });
  },

  findMySubscriptions(studentId: string) {
    return prisma.courseSubscription.findMany({
      where: { studentId },
      include: { course: true },
    });
  },

  createSubscription(studentId: string, courseId: string, expiresAt?: Date) {
    return prisma.courseSubscription.upsert({
      where: { studentId_courseId: { studentId, courseId } },
      update: { status: "ACTIVE", startedAt: new Date(), expiresAt },
      create: { studentId, courseId, status: "ACTIVE", expiresAt },
    });
  },

  searchStudents(query: string) {
    return prisma.user.findMany({
      where: {
        accountType: "STUDENT",
        OR: [
          { fullName: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      },
      select: { id: true, fullName: true, email: true },
      take: 10,
    });
  },
};
