import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthUser } from "../types/auth.types";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  setSession: (params: { accessToken: string; refreshToken: string; user: AuthUser }) => void;
  updateUser: (partial: Partial<AuthUser>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,

      setSession: ({ accessToken, refreshToken, user }) =>
        set({ accessToken, refreshToken, user, isAuthenticated: true }),

      updateUser: (partial) => set((state) => ({ user: state.user ? { ...state.user, ...partial } : state.user })),

      logout: () => set({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false }),
    }),
    { name: "nyayaone-company-auth" }
  )
);
