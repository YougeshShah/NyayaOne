import { AppError } from "../../../common/errors/AppError";
import { mcqRepository } from "../repository/mcq.repository";
import { courseService } from "../../course/service/course.service";
import { CreateMcqInput, UpdateMcqInput, ListMcqQuery } from "../dto/mcq.dto";

// Fields that MUST be stripped before a question ever reaches a student —
// leaking correctOption/explanation before they submit an answer would let
// them just read off the answer key.
function stripAnswerFields<T extends { correctOption?: unknown; explanation?: unknown }>(q: T) {
  const { correctOption, explanation, ...safe } = q as any;
  return safe;
}

export const mcqService = {
  async list(query: ListMcqQuery, studentId: string | null) {
    const skip = (query.page - 1) * query.limit;
    const { items, total } = await mcqRepository.findMany({
      courseId: query.courseId,
      subjectId: query.subjectId,
      examType: query.examType as any,
      difficulty: query.difficulty as any,
      skip,
      take: query.limit,
    });

    // For students, filter out locked (non-subscribed, non-demo) questions
    // entirely rather than showing them greyed-out — and always strip the
    // answer key from whatever remains visible.
    let visibleItems = items;
    if (studentId) {
      const accessChecks = await Promise.all(
        items.map((q: any) => courseService.canAccess(studentId, q.courseId, q.isFreeDemo))
      );
      visibleItems = items.filter((_: any, i: number) => accessChecks[i]).map(stripAnswerFields);
    }

    return {
      items: visibleItems,
      pagination: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) },
    };
  },

  async getById(id: string, studentId: string | null) {
    const question: any = await mcqRepository.findById(id);
    if (!question) throw AppError.notFound("Question not found");

    if (studentId) {
      const allowed = await courseService.canAccess(studentId, question.courseId, question.isFreeDemo);
      if (!allowed) throw AppError.forbidden("Subscribe to this course to access this question.");
      return stripAnswerFields(question);
    }

    return question;
  },

  async checkAnswer(id: string, selectedOption: string, studentId: string | null) {
    const question: any = await mcqRepository.findById(id);
    if (!question) throw AppError.notFound("Question not found");

    if (studentId) {
      const allowed = await courseService.canAccess(studentId, question.courseId, question.isFreeDemo);
      if (!allowed) throw AppError.forbidden("Subscribe to this course to access this question.");
    }

    return {
      isCorrect: selectedOption === question.correctOption,
      correctOption: question.correctOption,
      explanation: question.explanation,
    };
  },

  async create(input: CreateMcqInput, createdBy: string) {
    return mcqRepository.create({
      question: input.question,
      optionA: input.optionA,
      optionB: input.optionB,
      optionC: input.optionC,
      optionD: input.optionD,
      correctOption: input.correctOption,
      explanation: input.explanation,
      examType: input.examType as any,
      difficulty: input.difficulty as any,
      isFreeDemo: input.isFreeDemo,
      subject: { connect: { id: input.subjectId } },
      course: { connect: { id: input.courseId } },
      createdBy,
    } as any);
  },

  async update(id: string, input: UpdateMcqInput) {
    await this.getById(id, null);
    const { subjectId, courseId, ...rest } = input;
    return mcqRepository.update(id, {
      ...rest,
      ...(subjectId ? { subject: { connect: { id: subjectId } } } : {}),
      ...(courseId ? { course: { connect: { id: courseId } } } : {}),
    } as any);
  },

  async remove(id: string) {
    await this.getById(id, null);
    await mcqRepository.delete(id);
  },
};
