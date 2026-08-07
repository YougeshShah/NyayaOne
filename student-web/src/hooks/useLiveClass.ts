import { useMutation, useQuery } from "@tanstack/react-query";
import { liveClassApi } from "../api/liveClass.api";

export function useLiveClasses(courseId: string | undefined) {
  return useQuery({ queryKey: ["live-classes", courseId], queryFn: () => liveClassApi.list(courseId), enabled: !!courseId });
}

export function usePastLiveClasses(courseId: string | undefined) {
  return useQuery({ queryKey: ["past-live-classes", courseId], queryFn: () => liveClassApi.list(courseId, false), enabled: !!courseId });
}

export function useJoinLiveClass() {
  return useMutation({ mutationFn: (id: string) => liveClassApi.join(id) });
}
