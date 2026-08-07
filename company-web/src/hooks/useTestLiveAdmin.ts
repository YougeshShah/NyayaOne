import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mockTestAdminApi, liveClassAdminApi, CreateMockTestPayload, CreateLiveClassPayload } from "../api/testLiveAdmin.api";

export function useMockTestsAdmin(courseId?: string) {
  return useQuery({ queryKey: ["mock-tests-admin", courseId], queryFn: () => mockTestAdminApi.list(courseId), enabled: !!courseId });
}

export function useMockTestAdminActions() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["mock-tests-admin"] });

  const create = useMutation({
    mutationFn: (payload: CreateMockTestPayload) => mockTestAdminApi.create(payload),
    onSuccess: invalidate,
  });
  const publish = useMutation({
    mutationFn: (id: string) => mockTestAdminApi.publish(id),
    onSuccess: invalidate,
  });

  return { create, publish };
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

  return { create, hostJoin, markLive, cancel, uploadRecording };
}
