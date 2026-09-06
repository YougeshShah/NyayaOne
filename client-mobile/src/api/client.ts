import axios from "axios";
import Constants from "expo-constants";
import { useAuthStore } from "../store/authStore";

// apiBaseUrl comes from app.json -> expo.extra.apiBaseUrl.
// On a physical device this MUST be your computer's LAN IP (not "localhost"),
// e.g. http://192.168.1.42:5000/api/v1 — see README for how to find it.
const API_BASE_URL = (Constants.expoConfig?.extra?.apiBaseUrl as string) || "http://localhost:5000/api/v1";

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

// The access token is short-lived by design. Without this, every user got
// silently kicked to the login screen the moment it expired mid-session --
// this refreshes it once using the (longer-lived) refresh token and
// retries the original request, only logging out if the refresh itself
// fails (meaning the refresh token is also invalid/expired/revoked).
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = useAuthStore.getState().refreshToken;
  if (!refreshToken) return null;
  try {
    const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
    const newAccessToken = data?.data?.accessToken as string | undefined;
    if (!newAccessToken) return null;
    useAuthStore.getState().setAccessToken(newAccessToken);
    return newAccessToken;
  } catch {
    return null;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }
      const newAccessToken = await refreshPromise;
      if (newAccessToken) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      }
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
