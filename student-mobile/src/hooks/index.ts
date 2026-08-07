import { useMutation, useQuery } from "@tanstack/react-query";
import { authApi, courseApi, subjectApi, mcqApi } from "../api";
import { useAuthStore } from "../store/authStore";

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => setSession(data),
  });
}

export function useRegister() {
  return useMutation({ mutationFn: authApi.register });
}

export function useCourses() {
  return useQuery({ queryKey: ["courses"], queryFn: courseApi.list });
}

export function useMySubscriptions() {
  return useQuery({ queryKey: ["my-subscriptions"], queryFn: courseApi.mySubscriptions });
}

export function useSubjects(courseId: string) {
  return useQuery({ queryKey: ["subjects", courseId], queryFn: () => subjectApi.list(courseId), enabled: !!courseId });
}

export function useMcqList(courseId: string, subjectId?: string) {
  return useQuery({ queryKey: ["mcq", courseId, subjectId], queryFn: () => mcqApi.list(courseId, subjectId), enabled: !!courseId });
}

export function useCheckAnswer() {
  return useMutation({
    mutationFn: ({ id, selectedOption }: { id: string; selectedOption: "A" | "B" | "C" | "D" }) => mcqApi.checkAnswer(id, selectedOption),
  });
}
