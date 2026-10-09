import { create } from "zustand";
import type { UserProfile, AuthTokens } from "@/modules/auth/types";

interface AuthState {
  user: UserProfile | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  setAuth: (user: UserProfile, tokens: AuthTokens) => void;
  logout: () => void;
  updateUser: (user: UserProfile) => void;
}

/** Tương thích dữ liệu localStorage cũ từng lưu nguyên envelope `{ data: user }` */
const unpackUser = (rawUser: unknown): UserProfile | null => {
  if (!rawUser || typeof rawUser !== "object") return null;
  const wrapped = (rawUser as { data?: unknown }).data;
  return (wrapped && typeof wrapped === "object" ? wrapped : rawUser) as UserProfile;
};

const getInitialState = (): { user: UserProfile | null; tokens: AuthTokens | null; isAuthenticated: boolean } => {
  if (typeof window === "undefined") {
    return { user: null, tokens: null, isAuthenticated: false };
  }
  try {
    const access = localStorage.getItem("access_token");
    const refresh = localStorage.getItem("refresh_token");
    const userRaw = localStorage.getItem("user_profile");
    if (access && refresh && userRaw) {
      const parsedUser = unpackUser(JSON.parse(userRaw));
      return {
        user: parsedUser,
        tokens: { access, refresh },
        isAuthenticated: Boolean(parsedUser),
      };
    }
  } catch {}
  return { user: null, tokens: null, isAuthenticated: false };
};

const initial = getInitialState();

export const useAuthStore = create<AuthState>((set) => ({
  user: initial.user,
  tokens: initial.tokens,
  isAuthenticated: initial.isAuthenticated,

  setAuth: (rawUser, tokens) => {
    const user = unpackUser(rawUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", tokens.access);
      localStorage.setItem("refresh_token", tokens.refresh);
      if (user) {
        localStorage.setItem("user_profile", JSON.stringify(user));
      }
    }
    set({ user, tokens, isAuthenticated: Boolean(user) });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_profile");
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("app_nav_cache_")) {
          localStorage.removeItem(key);
        }
      });
    }
    set({ user: null, tokens: null, isAuthenticated: false });
  },

  updateUser: (rawUser) => {
    const user = unpackUser(rawUser);
    if (typeof window !== "undefined" && user) {
      localStorage.setItem("user_profile", JSON.stringify(user));
    }
    set({ user });
  },
}));
