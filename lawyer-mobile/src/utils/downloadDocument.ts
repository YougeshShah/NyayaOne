import { Paths, File, DownloadTask } from "expo-file-system";
import * as Sharing from "expo-sharing";
import Constants from "expo-constants";
import { useAuthStore } from "../store/authStore";

const API_BASE_URL = (Constants.expoConfig?.extra?.apiBaseUrl as string) || "http://localhost:5000/api/v1";

// expo-file-system's SDK 57 API replaced the old string-path
// (FileSystem.cacheDirectory + createDownloadResumable) approach with typed
// File/Directory objects and a DownloadTask class.
export async function downloadAndShareDocument(documentId: string, fileName: string) {
  const token = useAuthStore.getState().accessToken;
  const destination = new File(Paths.cache, fileName);

  const task = new DownloadTask(
    `${API_BASE_URL}/documents/${documentId}/download`,
    destination,
    { headers: token ? { Authorization: `Bearer ${token}` } : {} }
  );

  const downloadedFile = await task.downloadAsync();
  if (!downloadedFile) throw new Error("Download failed");

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) await Sharing.shareAsync(downloadedFile.uri);

  return downloadedFile.uri;
}
