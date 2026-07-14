import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/auth.api";
import { useAuthStore } from "../store/authStore";
import { LoginPayload } from "../types/auth.types";

const FIRM_ACCOUNT_TYPES = ["LAW_FIRM_ADMIN", "LAWYER", "STAFF"];

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (data) => {
      if (!FIRM_ACCOUNT_TYPES.includes(data.user.accountType)) {
        throw new Error("This portal is for law firm staff only.");
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
      authApi.logout(refreshToken).catch(() => {});
    }
    logout();
    navigate("/login");
  };
}
