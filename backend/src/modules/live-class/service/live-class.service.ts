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
  async list(query: ListLiveClassesQuery) {
    return liveClassRepository.findMany({ courseId: query.courseId, upcomingOnly: query.upcomingOnly });
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

  async create(input: CreateLiveClassInput, hostId: string) {
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
    });
  },

  /**
   * A student requests to join — this is the access-gate checkpoint. Only
   * on success do we hand back the actual meeting URL, so a non-subscribed
   * student never even learns the room name for paid content.
   */
  async joinAsStudent(liveClassId: string, studentId: string) {
    const liveClass = await this.getById(liveClassId);

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

  // The host (Company instructor) joins the same room without a subscription check.
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
