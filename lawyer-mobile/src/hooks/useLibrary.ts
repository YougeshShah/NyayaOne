import { useMutation, useQuery } from "@tanstack/react-query";
import { Paths, File, DownloadTask } from "expo-file-system";
import * as Sharing from "expo-sharing";
import Constants from "expo-constants";
import { libraryApi, LibraryResourceType } from "../api/library.api";
import { useAuthStore } from "../store/authStore";

export function useLibraryResources(params: { type?: LibraryResourceType; search?: string; page?: number }) {
  return useQuery({ queryKey: ["library", params], queryFn: () => libraryApi.list(params) });
}

const API_BASE_URL = (Constants.expoConfig?.extra?.apiBaseUrl as string) || "http://localhost:5000/api/v1";

export function useDownloadLibraryResource() {
  return useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const token = useAuthStore.getState().accessToken;
      const destination = new File(Paths.cache, title);

      const task = new DownloadTask(
        `${API_BASE_URL}/library/${id}/download`,
        destination,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      const downloadedFile = await task.downloadAsync();
      if (!downloadedFile) throw new Error("Download failed");

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) await Sharing.shareAsync(downloadedFile.uri);
      return downloadedFile.uri;
    },
  });
}
