import { AppError } from "../../../common/errors/AppError";
import { courseContentRepository } from "../repository/course-content.repository";

export const courseContentService = {
  async create(
    uploadedBy: string,
    lawFirmId: string | null,
    courseId: string,
    subjectId: string | undefined,
    term: string,
    title: string,
    fileType: "PDF" | "IMAGE" | "TEXT",
    fileUrl?: string,
    textBody?: string
  ) {
    if (fileType === "TEXT" && !textBody) throw AppError.badRequest("textBody is required for TEXT content");
    if ((fileType === "PDF" || fileType === "IMAGE") && !fileUrl) throw AppError.badRequest("A file is required for PDF/IMAGE content");
    return courseContentRepository.create({ courseId, subjectId, lawFirmId, term, title, fileType, fileUrl, textBody, uploadedBy });
  },

  async forStudent(courseId: string, studentLawFirmId: string | null, subjectId?: string, term?: string) {
    return courseContentRepository.listForStudent(courseId, studentLawFirmId, subjectId, term);
  },

  async forAdmin(courseId: string, lawFirmId: string | null) {
    return courseContentRepository.listForAdmin(courseId, lawFirmId);
  },

  // Only the SAME owner (Company for lawFirmId-null content, or the exact
  // institution for its own) may edit/delete -- one institution can never
  // touch another's or Company's content.
  async assertOwnership(id: string, lawFirmId: string | null) {
    const content = await courseContentRepository.findById(id);
    if (!content) throw AppError.notFound("Content not found");
    if (content.lawFirmId !== lawFirmId) throw AppError.forbidden("You do not own this content");
    return content;
  },

  async update(id: string, lawFirmId: string | null, data: { term?: string; title?: string; textBody?: string }) {
    await this.assertOwnership(id, lawFirmId);
    return courseContentRepository.update(id, data);
  },

  async remove(id: string, lawFirmId: string | null) {
    await this.assertOwnership(id, lawFirmId);
    return courseContentRepository.delete(id);
  },
};
