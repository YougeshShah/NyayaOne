import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import * as SecureStore from "expo-secure-store";
import { AuthUser } from "../types";

// Adapts Expo SecureStore (encrypted keychain/keystore) to Zustand's async storage interface.
// Tokens are never kept in plain AsyncStorage — SecureStore is the right place for JWTs on device.
const secureStorage: StateStorage = {
  getItem: async (name: string) => {
    return (await SecureStore.getItemAsync(name)) ?? null;
  },
  setItem: async (name: string, value: string) => {
    await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name: string) => {
    await SecureStore.deleteItemAsync(name);
  },
};

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  rememberMe: boolean;
  setSession: (params: { accessToken: string; refreshToken: string; user: AuthUser; rememberMe?: boolean }) => void;
  setAccessToken: (accessToken: string) => void;
  updateUser: (partial: Partial<AuthUser>) => void;
  logout: () => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      hasHydrated: false,
      rememberMe: true,

      setSession: ({ accessToken, refreshToken, user, rememberMe }) =>
        set({ accessToken, refreshToken, user, isAuthenticated: true, rememberMe: rememberMe ?? true }),

      setAccessToken: (accessToken) => set({ accessToken }),

      updateUser: (partial) => set((state) => ({ user: state.user ? { ...state.user, ...partial } : state.user })),

      logout: () => set({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false }),

      setHasHydrated: (state) => set({ hasHydrated: state }),
    }),
    {
      name: "technoone-lawyer-auth",
      storage: createJSONStorage(() => secureStorage),
      onRehydrateStorage: () => (state) => {
        // "Remember Me" was unchecked at login -- don't keep the user
        // signed in across app restarts; send them back to the login screen.
        if (state && state.rememberMe === false && state.isAuthenticated) {
          state.logout();
        }
        state?.setHasHydrated(true);
      },
    }
  )
);
