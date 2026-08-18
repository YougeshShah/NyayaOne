import { prisma } from "../../../database/prisma";
import { AppError } from "../../../common/errors/AppError";
import { SetLimitInput, ModuleType } from "../dto/usage-limit.dto";

function getLimitValue(
  row: { practiceLimit: number | null; mockTestLimit: number | null; speakingLimit: number | null } | null,
  type: ModuleType
): number | null {
  if (!row) return null;
  if (type === "practice") return row.practiceLimit;
  if (type === "mockTest") return row.mockTestLimit;
  return row.speakingLimit;
}

const MODULE_LABELS: Record<ModuleType, string> = {
  practice: "Practice",
  mockTest: "Mock Test",
  speaking: "Speaking Test",
};

export const usageLimitService = {
  // Resolves which policy row applies to a student: their own
  // institution's row for this course if they belong to one and it's
  // set, otherwise Company's platform-wide default (lawFirmId = null).
  // An institution not having set their own row does NOT mean unlimited
  // -- it falls through to Company's default, same as any direct student.
  async resolveLimit(courseId: string, studentLawFirmId: string | null) {
    if (studentLawFirmId) {
      const institutionLimit = await prisma.usageLimit.findFirst({
        where: { courseId, lawFirmId: studentLawFirmId },
      });
      if (institutionLimit) return institutionLimit;
    }
    return prisma.usageLimit.findFirst({
      where: { courseId, lawFirmId: null },
    });
  },

  async getUsage(studentId: string, courseId: string, type: ModuleType): Promise<number> {
    if (type === "practice") {
      return prisma.practiceSession.count({ where: { studentId, courseId } });
    }
    if (type === "mockTest") {
      return prisma.testAttempt.count({ where: { studentId, mockTest: { courseId } } });
    }
    return prisma.speakingSubmission.count({ where: { studentId, prompt: { courseId } } });
  },

  async getStatus(studentId: string, courseId: string, studentLawFirmId: string | null, type: ModuleType) {
    const limitRow = await this.resolveLimit(courseId, studentLawFirmId);
    const limitValue = getLimitValue(limitRow, type);

    if (limitValue === null) {
      return { limit: null, used: 0, remaining: null, unlimited: true };
    }
    const used = await this.getUsage(studentId, courseId, type);
    return { limit: limitValue, used, remaining: Math.max(0, limitValue - used), unlimited: false };
  },

  async getAllStatuses(studentId: string, courseId: string, studentLawFirmId: string | null) {
    const [practice, mockTest, speaking] = await Promise.all([
      this.getStatus(studentId, courseId, studentLawFirmId, "practice"),
      this.getStatus(studentId, courseId, studentLawFirmId, "mockTest"),
      this.getStatus(studentId, courseId, studentLawFirmId, "speaking"),
    ]);
    return { practice, mockTest, speaking };
  },

  // Called right before a new Practice session / Mock Test attempt /
  // Speaking submission is created -- throws if the student has no
  // remaining allowance, otherwise does nothing (caller proceeds normally).
  async enforce(studentId: string, courseId: string, studentLawFirmId: string | null, type: ModuleType) {
    const status = await this.getStatus(studentId, courseId, studentLawFirmId, type);
    if (!status.unlimited && status.remaining !== null && status.remaining <= 0) {
      throw AppError.forbidden(
        `You have reached your ${MODULE_LABELS[type]} limit (${status.limit}) for this course. Contact your institution or the platform admin for more attempts.`
      );
    }
  },

  // --- Admin CRUD -- lawFirmId is null for Company's platform-wide
  // default, or set to the caller's own institution id for their policy. ---
  async setLimit(input: SetLimitInput, lawFirmId: string | null, updatedBy: string) {
    const existing = await prisma.usageLimit.findFirst({ where: { courseId: input.courseId, lawFirmId } });
    if (existing) {
      return prisma.usageLimit.update({
        where: { id: existing.id },
        data: {
          practiceLimit: input.practiceLimit,
          mockTestLimit: input.mockTestLimit,
          speakingLimit: input.speakingLimit,
          updatedBy,
        },
      });
    }
    return prisma.usageLimit.create({
      data: {
        courseId: input.courseId,
        lawFirmId,
        practiceLimit: input.practiceLimit,
        mockTestLimit: input.mockTestLimit,
        speakingLimit: input.speakingLimit,
        updatedBy,
      },
    });
  },

  async getLimit(courseId: string, lawFirmId: string | null) {
    return prisma.usageLimit.findFirst({ where: { courseId, lawFirmId } });
  },
};
