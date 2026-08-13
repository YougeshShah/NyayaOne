import axios from "axios";
import { useAuthStore } from "../store/authStore";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

// Server origin (no /api/v1 suffix) — used to turn relative paths like
// "/uploads/audio/x.mp3" (as stored in the database) into a full URL an
// <audio> element can actually load.
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

// Attach access token to every outgoing request
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, log the user out (token expired/invalid) — the app will redirect to /login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
