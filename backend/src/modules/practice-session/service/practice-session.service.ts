import { prisma } from "../../../database/prisma";
import { usageLimitService } from "../../usage-limit/service/usage-limit.service";

export const practiceSessionService = {
  // Marks the boundary of "one practice session" -- called once when a
  // student opens Practice for a course. Enforces practiceLimit before
  // creating the session row; MCQ answering itself is unaffected once a
  // session has started (the limit governs how many times Practice can be
  // opened, not how many questions are answered within it).
  async start(studentId: string, courseId: string, studentLawFirmId: string | null) {
    await usageLimitService.enforce(studentId, courseId, studentLawFirmId, "practice");
    return prisma.practiceSession.create({ data: { studentId, courseId } });
  },
};
