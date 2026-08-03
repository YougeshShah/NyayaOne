import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import Constants from "expo-constants";
import { useAuthStore } from "../store/authStore";

const API_BASE_URL = (Constants.expoConfig?.extra?.apiBaseUrl as string) || "http://localhost:5000/api/v1";

export async function downloadAndShareDocument(documentId: string, fileName: string) {
  const token = useAuthStore.getState().accessToken;
  const fileUri = FileSystem.cacheDirectory + fileName;

  const downloadResumable = FileSystem.createDownloadResumable(
    `${API_BASE_URL}/documents/${documentId}/download`,
    fileUri,
    { headers: token ? { Authorization: `Bearer ${token}` } : {} }
  );

  const result = await downloadResumable.downloadAsync();
  if (!result) throw new Error("Download failed");

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) await Sharing.shareAsync(result.uri);

  return result.uri;
}
