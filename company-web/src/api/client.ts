import axios from "axios";
import { useAuthStore } from "../store/authStore";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1",
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

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = useAuthStore.getState().refreshToken;
  if (!refreshToken) return null;
  try {
    const { data } = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1"}/auth/refresh`,
      { refreshToken }
    );
    const newAccessToken = data?.data?.accessToken as string | undefined;
    if (!newAccessToken) return null;
    useAuthStore.getState().setAccessToken(newAccessToken);
    return newAccessToken;
  } catch {
    return null;
  }
}

// On 401, try refreshing the access token once and retrying the original
// request -- only log the user out if the refresh token is also invalid.
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
