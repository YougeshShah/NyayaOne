import { AppError } from "../../../common/errors/AppError";
import { mockTestRepository } from "../repository/mock-test.repository";
import { mcqRepository } from "../../mcq/repository/mcq.repository";
import { courseService } from "../../course/service/course.service";
import { CreateMockTestInput, ListMockTestsQuery, SubmitAttemptInput } from "../dto/mock-test.dto";

export const mockTestService = {
  async list(query: ListMockTestsQuery) {
    return mockTestRepository.findMany({
      courseId: query.courseId,
      examType: query.examType as any,
      publishedOnly: query.publishedOnly,
    });
  },

  async getById(id: string) {
    const test = await mockTestRepository.findById(id);
    if (!test) throw AppError.notFound("Mock test not found");
    return test;
  },

  /**
   * Company creates a mock test by specifying course/exam type + how many
   * questions to pull — the actual questions are randomly sampled from the
   * question bank matching that course/subject, not hand-picked one by one.
   */
  async create(input: CreateMockTestInput, createdBy: string) {
    const test = await mockTestRepository.create({
      title: input.title,
      courseId: input.courseId,
      examType: input.examType as any,
      subjectId: input.subjectId,
      durationMinutes: input.durationMinutes,
      createdBy,
    });

    const questionIds = await mcqRepository.findRandom({
      courseId: input.courseId,
      subjectId: input.subjectId,
      examType: input.examType as any,
      count: input.questionCount,
    });

    if (questionIds.length === 0) {
      throw AppError.badRequest("No questions found in the question bank for this course/subject — add questions first.");
    }

    await mockTestRepository.addQuestions(test.id, questionIds);
    return { ...test, questionCount: questionIds.length };
  },

  async publish(id: string) {
    await this.getById(id);
    return mockTestRepository.publish(id);
  },

  /**
   * A student starts an attempt — gated the same way as MCQs/LiveClasses:
   * free-demo tests are open to everyone, everything else needs an active
   * course subscription.
   */
  async startAttempt(studentId: string, mockTestId: string) {
    const test = await this.getById(mockTestId);
    if (!test.isPublished) throw AppError.badRequest("This mock test is not published yet");

    const allowed = await courseService.canAccess(studentId, (test as any).courseId, (test as any).isFreeDemo);
    if (!allowed) throw AppError.forbidden("Subscribe to this course to take this mock test.");

    const attempt = await mockTestRepository.createAttempt(studentId, mockTestId, test.questions.length);
    return { attemptId: attempt.id, totalQuestions: test.questions.length, durationMinutes: test.durationMinutes };
  },

  /**
   * Auto-grades on submit — compares each selected option against the
   * correct answer stored server-side, so a student can never see or tamper
   * with the answer key before submitting.
   */
  async submitAttempt(attemptId: string, studentId: string, input: SubmitAttemptInput) {
    const attempt = await mockTestRepository.findAttemptById(attemptId);
    if (!attempt) throw AppError.notFound("Attempt not found");
    if (attempt.studentId !== studentId) throw AppError.forbidden("This is not your attempt");
    if (attempt.submittedAt) throw AppError.badRequest("This attempt has already been submitted");

    const test = await this.getById(attempt.mockTestId);
    const correctAnswerMap = new Map(
      test.questions.map((q: { questionId: string; question: { correctOption: string } }) => [q.questionId, q.question.correctOption])
    );

    let correctCount = 0;
    const gradedAnswers = input.answers.map((a) => {
      const correctOption = correctAnswerMap.get(a.questionId);
      const isCorrect = a.selectedOption !== null && a.selectedOption === correctOption;
      if (isCorrect) correctCount++;
      return { questionId: a.questionId, selectedOption: a.selectedOption, isCorrect };
    });

    await mockTestRepository.saveAnswers(attemptId, gradedAnswers);
    const updated = await mockTestRepository.submitAttempt(attemptId, correctCount);

    return {
      score: correctCount,
      totalQuestions: attempt.totalQuestions,
      percentage: Math.round((correctCount / attempt.totalQuestions) * 100),
      submittedAt: updated.submittedAt,
    };
  },

  async myAttempts(studentId: string) {
    return mockTestRepository.findAttemptsByStudent(studentId);
  },

  async getAttemptResult(attemptId: string, studentId: string) {
    const attempt = await mockTestRepository.findAttemptById(attemptId);
    if (!attempt) throw AppError.notFound("Attempt not found");
    if (attempt.studentId !== studentId) throw AppError.forbidden("This is not your attempt");
    if (!attempt.submittedAt) throw AppError.badRequest("This attempt has not been submitted yet");
    return attempt;
  },
};
