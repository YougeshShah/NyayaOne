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
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (data) => {
      if (data.user.accountType !== "CLIENT") {
        throw new Error("This app is for clients only. Use the Lawyer app if you are a lawyer or staff member.");
      }
      setSession(data);
      router.replace("/(tabs)/dashboard");
      registerForPushNotifications().catch(() => {});
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
