import { AppError } from "../../../common/errors/AppError";
import { subjectRepository } from "../repository/subject.repository";
import { CreateSubjectInput, ListSubjectsQuery } from "../dto/subject.dto";

export const subjectService = {
  async list(query: ListSubjectsQuery) {
    return subjectRepository.findMany({ courseId: query.courseId, examType: query.examType as any });
  },

  async create(input: CreateSubjectInput) {
    const existing = await subjectRepository.findByNameAndCourse(input.name, input.courseId);
    if (existing) {
      throw AppError.conflict("This subject already exists for this course");
    }
    return subjectRepository.create({ name: input.name, courseId: input.courseId, examType: input.examType as any });
  },

  async remove(id: string) {
    const subject = await subjectRepository.findById(id);
    if (!subject) throw AppError.notFound("Subject not found");
    await subjectRepository.delete(id);
  },
};
