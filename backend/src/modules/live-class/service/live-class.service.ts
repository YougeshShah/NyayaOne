import { randomBytes } from "crypto";
import { AppError } from "../../../common/errors/AppError";
import { liveClassRepository } from "../repository/live-class.repository";
import { courseService } from "../../course/service/course.service";
import { CreateLiveClassInput, ListLiveClassesQuery } from "../dto/live-class.dto";

// Free public Jitsi Meet server — no API key, no per-minute cost. Self-hosting
// is a drop-in swap later (just change this base URL) if usage outgrows what
// the public instance comfortably handles.
const JITSI_BASE_URL = "https://meet.jit.si";

function generateRoomName(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
  const uniqueSuffix = randomBytes(4).toString("hex");
  return `nyayaone-${slug}-${uniqueSuffix}`;
}

export const liveClassService = {
  async list(query: ListLiveClassesQuery, opts: { studentLawFirmId?: string | null; forLawFirmId?: string } = {}) {
    return liveClassRepository.findMany({
      courseId: query.courseId,
      upcomingOnly: query.upcomingOnly,
      studentLawFirmId: opts.studentLawFirmId,
      forLawFirmId: opts.forLawFirmId,
    });
  },

  async getById(id: string, studentId?: string | null) {
    const liveClass: any = await liveClassRepository.findById(id);
    if (!liveClass) throw AppError.notFound("Live class not found");

    if (studentId && liveClass.recordingUrl) {
      const allowed = await courseService.canAccess(studentId, liveClass.courseId, liveClass.isFreeDemo);
      if (!allowed) {
        return { ...liveClass, recordingUrl: null };
      }
    }
    return liveClass;
  },

  async create(input: CreateLiveClassInput, hostId: string, hostLawFirmId?: string) {
    const jitsiRoomName = generateRoomName(input.title);
    return liveClassRepository.create({
      courseId: input.courseId,
      subjectId: input.subjectId,
      title: input.title,
      description: input.description,
      hostId,
      jitsiRoomName,
      scheduledAt: new Date(input.scheduledAt),
      durationMinutes: input.durationMinutes,
      isFreeDemo: input.isFreeDemo,
      hostLawFirmId,
    });
  },

  /**
   * A student requests to join — checks BOTH course access AND, for
   * institution-hosted classes, that the student actually belongs to that
   * institution (an IELTS-course subscriber from Institute A should never
   * be able to join Institute B's class for the same course).
   */
  async joinAsStudent(liveClassId: string, studentId: string, studentLawFirmId: string | null) {
    const liveClass: any = await this.getById(liveClassId);

    if (liveClass.hostLawFirmId && liveClass.hostLawFirmId !== studentLawFirmId) {
      throw AppError.forbidden("This class is only open to students of the hosting institution.");
    }

    const allowed = await courseService.canAccess(studentId, liveClass.courseId, liveClass.isFreeDemo);
    if (!allowed) {
      throw AppError.forbidden("Subscribe to this course to join this live class.");
    }

    await liveClassRepository.recordAttendance(liveClassId, studentId);

    return {
      meetingUrl: `${JITSI_BASE_URL}/${liveClass.jitsiRoomName}`,
      roomName: liveClass.jitsiRoomName,
      title: liveClass.title,
    };
  },

  // The host (Company or institution instructor) joins the same room without a subscription check.
  async joinAsHost(liveClassId: string) {
    const liveClass = await this.getById(liveClassId);
    return {
      meetingUrl: `${JITSI_BASE_URL}/${liveClass.jitsiRoomName}`,
      roomName: liveClass.jitsiRoomName,
      title: liveClass.title,
    };
  },

  async markLive(id: string) {
    await this.getById(id);
    return liveClassRepository.setStatus(id, "LIVE");
  },

  async markEnded(id: string) {
    await this.getById(id);
    return liveClassRepository.setStatus(id, "ENDED");
  },

  async uploadRecording(id: string, recordingUrl: string) {
    await this.getById(id);
    return liveClassRepository.setRecordingUrl(id, recordingUrl);
  },

  async cancel(id: string) {
    await this.getById(id);
    return liveClassRepository.setStatus(id, "CANCELLED");
  },
};
