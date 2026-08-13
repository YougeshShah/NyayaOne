import axios from "axios";
import Constants from "expo-constants";
import { useAuthStore } from "../store/authStore";

// apiBaseUrl comes from app.json -> expo.extra.apiBaseUrl.
// On a physical device this MUST be your computer's LAN IP (not "localhost"),
// e.g. http://192.168.1.42:5000/api/v1 — see README for how to find it.
const API_BASE_URL = (Constants.expoConfig?.extra?.apiBaseUrl as string) || "http://localhost:5000/api/v1";

// The server origin (no /api/v1 suffix) — needed to turn relative paths
// like "/uploads/audio/x.mp3" (as stored in the database) into a full URL
// that Linking.openURL() or an <audio>/video component can actually open.
export const SERVER_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, "");

export function resolveMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${SERVER_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
