import { prisma } from "../../../database/prisma";

export const liveClassRepository = {
  // studentLawFirmId (when provided) means: only show platform-wide classes
  // (hostLawFirmId null) PLUS this student's own institution's classes —
  // never another institution's classes, even for the same course.
  async findMany(params: { courseId?: string; upcomingOnly: boolean; studentLawFirmId?: string | null; forLawFirmId?: string; onlyHostId?: string }) {
    const classes = await prisma.liveClass.findMany({
      where: {
        ...(params.courseId ? { courseId: params.courseId } : {}),
        ...(params.upcomingOnly ? { scheduledAt: { gte: new Date() }, status: { not: "CANCELLED" } } : {}),
        ...(params.forLawFirmId
          ? { hostLawFirmId: params.forLawFirmId } // Institution staff view — only their own scheduled classes
          : params.studentLawFirmId !== undefined
          ? { OR: [{ hostLawFirmId: null }, { hostLawFirmId: params.studentLawFirmId }] } // Student view
          : {}),
        // A regular teacher/staff account (not the institution admin) only
        // sees classes specifically assigned to them -- previously any
        // staff member saw every class the whole institution scheduled,
        // even ones assigned to a different teacher.
        ...(params.onlyHostId ? { hostId: params.onlyHostId } : {}),
      },
      include: { course: true, subject: true, _count: { select: { attendees: true } } },
      orderBy: { scheduledAt: "asc" },
    });

    // hostId has no Prisma relation to User (it's a plain string field, not
    // set up as a foreign key relation in the schema) -- fetch the hosts'
    // names in one batched query and attach them manually, rather than a
    // schema migration just for this display purpose.
    const hostIds = [...new Set(classes.map((c) => c.hostId))];
    const hosts = await prisma.user.findMany({ where: { id: { in: hostIds } }, select: { id: true, fullName: true } });
    const hostById = new Map(hosts.map((h) => [h.id, h]));

    return classes.map((c) => ({ ...c, host: hostById.get(c.hostId) ?? null }));
  },

  delete(id: string) {
    return prisma.liveClass.delete({ where: { id } });
  },

  listAttendees(liveClassId: string) {
    return prisma.liveClassAttendance.findMany({
      where: { liveClassId },
      include: { student: { select: { id: true, fullName: true, email: true } } },
      orderBy: { joinedAt: "asc" },
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

  async setCohosts(liveClassId: string, primaryHostId: string, allHostIds: string[]) {
    await prisma.liveClassHost.deleteMany({ where: { liveClassId } });
    await prisma.liveClassHost.createMany({
      data: allHostIds.map((hostId) => ({
        liveClassId,
        hostId,
        isPrimary: hostId === primaryHostId,
      })),
    });
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

  update(id: string, data: { title?: string; description?: string; scheduledAt?: Date; durationMinutes?: number; isFreeDemo?: boolean; hostId?: string }) {
    return prisma.liveClass.update({ where: { id }, data });
  },
};
