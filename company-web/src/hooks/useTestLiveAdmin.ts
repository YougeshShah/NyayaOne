import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mockTestAdminApi, liveClassAdminApi, CreateMockTestPayload, CreateLiveClassPayload } from "../api/testLiveAdmin.api";

export function useMockTestsAdmin(courseId?: string) {
  return useQuery({ queryKey: ["mock-tests-admin", courseId], queryFn: () => mockTestAdminApi.list(courseId), enabled: !!courseId });
}

export function useMockTestAdminActions() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["mock-tests-admin"] });
  const invalidateDetail = () => qc.invalidateQueries({ queryKey: ["mock-test-detail-admin"] });

  const create = useMutation({
    mutationFn: (payload: CreateMockTestPayload) => mockTestAdminApi.create(payload),
    onSuccess: invalidate,
  });
  const publish = useMutation({
    mutationFn: (id: string) => mockTestAdminApi.publish(id),
    onSuccess: invalidate,
  });
  const addQuestion = useMutation({
    mutationFn: ({ mockTestId, questionId, marks }: { mockTestId: string; questionId: string; marks: number }) =>
      mockTestAdminApi.addQuestion(mockTestId, questionId, marks),
    onSuccess: () => {
      invalidate();
      invalidateDetail();
    },
  });
  const removeQuestion = useMutation({
    mutationFn: ({ mockTestId, questionId }: { mockTestId: string; questionId: string }) => mockTestAdminApi.removeQuestion(mockTestId, questionId),
    onSuccess: () => {
      invalidate();
      invalidateDetail();
    },
  });

  return { create, publish, addQuestion, removeQuestion };
}

export function useMockTestDetailAdmin(mockTestId: string | null) {
  return useQuery({
    queryKey: ["mock-test-detail-admin", mockTestId],
    queryFn: () => mockTestAdminApi.getById(mockTestId!),
    enabled: !!mockTestId,
  });
}

export function useLiveClassesAdmin(courseId?: string) {
  return useQuery({ queryKey: ["live-classes-admin", courseId], queryFn: () => liveClassAdminApi.list(courseId), enabled: !!courseId });
}

export function useLiveClassAdminActions() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["live-classes-admin"] });

  const create = useMutation({
    mutationFn: (payload: CreateLiveClassPayload) => liveClassAdminApi.create(payload),
    onSuccess: invalidate,
  });
  const hostJoin = useMutation({
    mutationFn: (id: string) => liveClassAdminApi.hostJoin(id),
  });
  const markLive = useMutation({
    mutationFn: (id: string) => liveClassAdminApi.markLive(id),
    onSuccess: invalidate,
  });
  const cancel = useMutation({
    mutationFn: (id: string) => liveClassAdminApi.cancel(id),
    onSuccess: invalidate,
  });
  const uploadRecording = useMutation({
    mutationFn: ({ id, recordingUrl }: { id: string; recordingUrl: string }) => liveClassAdminApi.uploadRecording(id, recordingUrl),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { title?: string; scheduledAt?: string; durationMinutes?: number } }) =>
      liveClassAdminApi.update(id, payload),
    onSuccess: invalidate,
  });

  return { create, hostJoin, markLive, cancel, uploadRecording, update };
}
