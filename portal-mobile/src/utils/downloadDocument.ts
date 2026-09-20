import { Linking } from "react-native";
import Constants from "expo-constants";
import { useAuthStore } from "../store/authStore";

const API_BASE_URL = (Constants.expoConfig?.extra?.apiBaseUrl as string) || "http://localhost:5000/api/v1";

// Opens the document directly in the device's browser/PDF viewer via
// Linking, instead of downloading locally + expo-sharing. This avoids
// depending on native modules (expo-file-system, expo-sharing) that need a
// fresh native build to work — Linking is core React Native, already
// bundled, works immediately with no rebuild.
export async function downloadAndShareDocument(documentId: string, _fileName: string) {
  const token = useAuthStore.getState().accessToken;
  const url = `${API_BASE_URL}/documents/${documentId}/download${token ? `?token=${encodeURIComponent(token)}` : ""}`;
  await Linking.openURL(url);
  return url;
}
