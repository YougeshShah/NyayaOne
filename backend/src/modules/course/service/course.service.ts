import { AppError } from "../../../common/errors/AppError";
import { courseRepository } from "../repository/course.repository";
import { CreateCourseInput, UpdateCourseInput } from "../dto/course.dto";

export const courseService = {
  async list(activeOnly: boolean) {
    return courseRepository.findMany(activeOnly);
  },

  async getById(id: string) {
    const course = await courseRepository.findById(id);
    if (!course) throw AppError.notFound("Course not found");
    return course;
  },

  async create(input: CreateCourseInput) {
    const existing = await courseRepository.findByName(input.name);
    if (existing) throw AppError.conflict("A course with this name already exists");
    return courseRepository.create(input);
  },

  async update(id: string, input: UpdateCourseInput) {
    await this.getById(id);
    return courseRepository.update(id, input as any);
  },

  async mySubscriptions(studentId: string) {
    return courseRepository.findMySubscriptions(studentId);
  },

  /**
   * The single reusable access-gate used by MCQ, MockTest, and LiveClass
   * services alike: content is visible if it's marked isFreeDemo, OR the
   * student has an active subscription to its course. Everything funnels
   * through here so the free/paid rule only needs to be right in one place.
   */
  async canAccess(studentId: string, courseId: string, isFreeDemo: boolean): Promise<boolean> {
    if (isFreeDemo) return true;
    const sub = await courseRepository.findActiveSubscription(studentId, courseId);
    return !!sub;
  },

  // Demo-only subscribe (no payment gateway wired yet) — Company/Admin can
  // grant access manually until a real payment flow exists. Real checkout
  // integration is a separate, later piece of work.
  async grantSubscription(studentId: string, courseId: string, expiresAt?: Date) {
    await this.getById(courseId);
    return courseRepository.createSubscription(studentId, courseId, expiresAt);
  },

  async searchStudents(query: string) {
    return courseRepository.searchStudents(query);
  },
};
