import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { courseApi, subjectApi } from "../api/courseAdmin.api";
import { mcqAdminApi, CreateMcqPayload } from "../api/mcqAdmin.api";

export function useSearchStudents(q: string) {
  return useQuery({
    queryKey: ["search-students", q],
    queryFn: () => courseApi.searchStudents(q),
    enabled: q.length >= 2,
  });
}

export function useGrantSubscription() {
  return useMutation({
    mutationFn: ({ courseId, studentId, expiresAt }: { courseId: string; studentId: string; expiresAt?: string }) =>
      courseApi.grantSubscription(courseId, studentId, expiresAt),
  });
}

export function useCoursesAdmin() {
  return useQuery({ queryKey: ["courses-admin"], queryFn: () => courseApi.list() });
}

export function useCourseAdminActions() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["courses-admin"] });

  const create = useMutation({
    mutationFn: (payload: { name: string; category: string; description?: string }) => courseApi.create(payload),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => courseApi.update(id, payload),
    onSuccess: invalidate,
  });

  return { create, update };
}

export function useSubjectsAdmin(courseId?: string) {
  return useQuery({ queryKey: ["subjects-admin", courseId], queryFn: () => subjectApi.list(courseId) });
}

export function useSubjectAdminActions() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["subjects-admin"] });

  const create = useMutation({
    mutationFn: (payload: { name: string; courseId: string; examType?: string }) => subjectApi.create(payload),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: string) => subjectApi.remove(id),
    onSuccess: invalidate,
  });

  return { create, remove };
}

export function useMcqAdminList(params: { courseId?: string; subjectId?: string; page?: number }) {
  return useQuery({ queryKey: ["mcq-admin", params], queryFn: () => mcqAdminApi.list(params), enabled: !!params.courseId });
}

export function useMcqAdminActions() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["mcq-admin"] });

  const create = useMutation({
    mutationFn: (payload: CreateMcqPayload) => mcqAdminApi.create(payload),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateMcqPayload> }) => mcqAdminApi.update(id, payload),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: string) => mcqAdminApi.remove(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
