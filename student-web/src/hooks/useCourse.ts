import { useMutation, useQuery } from "@tanstack/react-query";
import { courseApi, subjectApi, mcqApi, mockTestApi } from "../api/course.api";
import { writingSubmissionApi } from "../api/testSection.api";

export function useCourses() {
  return useQuery({ queryKey: ["courses"], queryFn: () => courseApi.list() });
}

export function useCourse(id: string | undefined) {
  return useQuery({ queryKey: ["course", id], queryFn: () => courseApi.getById(id as string), enabled: !!id });
}

export function useMySubscriptions() {
  return useQuery({ queryKey: ["my-subscriptions"], queryFn: () => courseApi.mySubscriptions() });
}

export function useSubjects(courseId: string | undefined) {
  return useQuery({ queryKey: ["subjects", courseId], queryFn: () => subjectApi.list(courseId), enabled: !!courseId });
}

export function useMcqList(params: { courseId?: string; subjectId?: string; page?: number }) {
  return useQuery({ queryKey: ["mcq", params], queryFn: () => mcqApi.list(params), enabled: !!params.courseId });
}

export function useMyMistakes(courseId?: string) {
  return useQuery({ queryKey: ["my-mistakes", courseId], queryFn: () => mcqApi.myMistakes(courseId) });
}

export function useCheckAnswer() {
  return useMutation({
    mutationFn: ({ id, selectedOption }: { id: string; selectedOption: string }) => mcqApi.checkAnswer(id, selectedOption),
  });
}

export function useMockTests(courseId: string | undefined) {
  return useQuery({ queryKey: ["mock-tests", courseId], queryFn: () => mockTestApi.list({ courseId }), enabled: !!courseId });
}

export function useMockTestDetail(id: string | undefined) {
  return useQuery({ queryKey: ["mock-test", id], queryFn: () => mockTestApi.getById(id as string), enabled: !!id });
}

export function useStartAttempt() {
  return useMutation({ mutationFn: (mockTestId: string) => mockTestApi.startAttempt(mockTestId) });
}

export function useSubmitAttempt() {
  return useMutation({
    mutationFn: ({ attemptId, answers }: { attemptId: string; answers: { questionId: string; selectedOption: string | null }[] }) =>
      mockTestApi.submitAttempt(attemptId, answers),
  });
}

export function useMyAttempts() {
  return useQuery({ queryKey: ["my-attempts"], queryFn: () => mockTestApi.myAttempts() });
}

export function useSubmitWriting() {
  return useMutation({
    mutationFn: (payload: { sectionId: string; attemptId: string; essayText: string }) => writingSubmissionApi.submit(payload),
  });
}
