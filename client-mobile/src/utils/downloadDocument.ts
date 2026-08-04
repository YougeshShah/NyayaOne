import { Paths, File, DownloadTask } from "expo-file-system";
import * as Sharing from "expo-sharing";
import Constants from "expo-constants";
import { useAuthStore } from "../store/authStore";

const API_BASE_URL = (Constants.expoConfig?.extra?.apiBaseUrl as string) || "http://localhost:5000/api/v1";

/**
 * Downloads a document from the (authenticated, tenant-scoped) backend endpoint
 * directly to the device's cache using expo-file-system, then opens the native
 * share/open sheet. This is the correct mobile pattern — web's blob+<a download>
 * trick doesn't apply in React Native.
 *
 * Uses the SDK 57 File/Directory/DownloadTask API — the older string-path
 * (FileSystem.cacheDirectory + createDownloadResumable) API was removed.
 */
export async function downloadAndShareDocument(documentId: string, fileName: string) {
  const token = useAuthStore.getState().accessToken;
  const destination = new File(Paths.cache, fileName);

  const task = new DownloadTask(
    `${API_BASE_URL}/client-portal/documents/${documentId}/download`,
    destination,
    { headers: token ? { Authorization: `Bearer ${token}` } : {} }
  );

  const downloadedFile = await task.downloadAsync();
  if (!downloadedFile) {
    throw new Error("Download failed");
  }

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(downloadedFile.uri);
  }

  return downloadedFile.uri;
}
