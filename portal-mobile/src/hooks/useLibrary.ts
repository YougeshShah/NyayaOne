import { useMutation, useQuery } from "@tanstack/react-query";
import { Linking } from "react-native";
import Constants from "expo-constants";
import { libraryApi, LibraryResourceType } from "../api/library.api";
import { useAuthStore } from "../store/authStore";

export function useLibraryResources(params: { type?: LibraryResourceType; search?: string; page?: number }) {
  return useQuery({ queryKey: ["library", params], queryFn: () => libraryApi.list(params) });
}

const API_BASE_URL = (Constants.expoConfig?.extra?.apiBaseUrl as string) || "http://localhost:5000/api/v1";

// Opens the resource directly via the device browser/PDF viewer (Linking)
// instead of downloading locally + expo-sharing — avoids needing native
// modules that require a fresh build to work.
export function useDownloadLibraryResource() {
  return useMutation({
    mutationFn: async ({ id }: { id: string; title: string }) => {
      const token = useAuthStore.getState().accessToken;
      const url = `${API_BASE_URL}/library/${id}/download${token ? `?token=${encodeURIComponent(token)}` : ""}`;
      await Linking.openURL(url);
      return url;
    },
  });
}
