import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/auth.api";
import { useAuthStore } from "../store/authStore";
import { LoginPayload } from "../types/auth.types";

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (data) => {
      if (data.user.accountType !== "COMPANY") {
        throw new Error("This portal is for TrailBlaze Tech company staff only.");
      }
      setSession(data);
      navigate("/dashboard");
    },
  });
}

export function useLogout() {
  const { refreshToken, logout } = useAuthStore();
  const navigate = useNavigate();

  return () => {
    if (refreshToken) {
      authApi.logout(refreshToken).catch(() => {
        // ignore network errors on logout — clear local session regardless
      });
    }
    logout();
    navigate("/login");
  };
}
