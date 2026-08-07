import { prisma } from "../../../database/prisma";

export const liveClassRepository = {
  // studentLawFirmId (when provided) means: only show platform-wide classes
  // (hostLawFirmId null) PLUS this student's own institution's classes —
  // never another institution's classes, even for the same course.
  findMany(params: { courseId?: string; upcomingOnly: boolean; studentLawFirmId?: string | null; forLawFirmId?: string }) {
    return prisma.liveClass.findMany({
      where: {
        ...(params.courseId ? { courseId: params.courseId } : {}),
        ...(params.upcomingOnly ? { scheduledAt: { gte: new Date() }, status: { not: "CANCELLED" } } : {}),
        ...(params.forLawFirmId
          ? { hostLawFirmId: params.forLawFirmId } // Institution staff view — only their own scheduled classes
          : params.studentLawFirmId !== undefined
          ? { OR: [{ hostLawFirmId: null }, { hostLawFirmId: params.studentLawFirmId }] } // Student view
          : {}),
      },
      include: { course: true, subject: true, _count: { select: { attendees: true } } },
      orderBy: { scheduledAt: "asc" },
    });
  },

  findById(id: string) {
    return prisma.liveClass.findUnique({
      where: { id },
      include: { course: true, subject: true },
    });
  },

  create(data: {
    courseId: string;
    subjectId?: string;
    title: string;
    description?: string;
    hostId: string;
    jitsiRoomName: string;
    scheduledAt: Date;
    durationMinutes: number;
    isFreeDemo: boolean;
    hostLawFirmId?: string;
  }) {
    return prisma.liveClass.create({ data });
  },

  recordAttendance(liveClassId: string, studentId: string) {
    return prisma.liveClassAttendance.upsert({
      where: { liveClassId_studentId: { liveClassId, studentId } },
      update: {},
      create: { liveClassId, studentId },
    });
  },

  setStatus(id: string, status: "SCHEDULED" | "LIVE" | "ENDED" | "CANCELLED") {
    return prisma.liveClass.update({ where: { id }, data: { status } });
  },

  setRecordingUrl(id: string, recordingUrl: string) {
    return prisma.liveClass.update({ where: { id }, data: { recordingUrl } });
  },
};
