import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { authApi } from "../api/auth.api";
import { useAuthStore } from "../store/authStore";
import { LoginPayload } from "../types";
import { registerForPushNotifications } from "../utils/pushNotifications";

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  const router = useRouter();

  return useMutation({
    mutationFn: ({ rememberMe, ...credentials }: LoginPayload & { rememberMe?: boolean }) => authApi.login(credentials),
    onSuccess: (data, variables) => {
      const allowedTypes = ["LAWYER", "STAFF", "LAW_FIRM_ADMIN"];
      if (!allowedTypes.includes(data.user.accountType)) {
        throw new Error("This app is for law firm/institution staff only. Use the Client or Student app otherwise.");
      }
      setSession({ ...data, rememberMe: variables.rememberMe });
      router.replace("/(tabs)/dashboard");
      registerForPushNotifications().catch(() => {
        // non-fatal — user can still use the app without push notifications
      });
    },
  });
}

export function useLogout() {
  const { refreshToken, logout } = useAuthStore();
  const router = useRouter();

  return () => {
    if (refreshToken) {
      authApi.logout(refreshToken).catch(() => {});
    }
    logout();
    router.replace("/(auth)/login");
  };
}
