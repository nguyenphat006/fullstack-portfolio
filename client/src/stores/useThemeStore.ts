"use client";

import { create } from "zustand";
import { STORAGE_KEYS } from "@/config/app";

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

interface ThemeState {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
  /** Đọc lựa chọn đã lưu sau khi mount (server luôn render "light" để tránh hydration mismatch) */
  hydrate: () => void;
  /** Đồng bộ lại khi hệ điều hành đổi sáng/tối (chế độ "system") */
  syncSystem: () => void;
}

function systemPrefersDark(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolve(mode: ThemeMode): ResolvedTheme {
  if (mode === "system") return systemPrefersDark() ? "dark" : "light";
  return mode;
}

function readStoredMode(): ThemeMode {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(STORAGE_KEYS.themeMode);
  return stored === "dark" || stored === "system" || stored === "light" ? stored : "light";
}

function applyToDocument(resolved: ResolvedTheme) {
  if (typeof document !== "undefined") document.documentElement.dataset.theme = resolved;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: "light",
  resolved: "light",
  hydrate: () => {
    const mode = readStoredMode();
    const resolved = resolve(mode);
    applyToDocument(resolved);
    set({ mode, resolved });
  },
  setMode: (mode) => {
    const resolved = resolve(mode);
    window.localStorage.setItem(STORAGE_KEYS.themeMode, mode);
    applyToDocument(resolved);
    set({ mode, resolved });
  },
  syncSystem: () => {
    if (get().mode !== "system") return;
    const resolved = resolve("system");
    applyToDocument(resolved);
    set({ resolved });
  },
}));

/**
 * Script chạy trước khi React hydrate: gán data-theme cho <html> để không bị nháy trắng khi F5 ở chế độ tối.
 * Phải đồng bộ logic với readStoredMode/resolve ở trên.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var m=localStorage.getItem('${STORAGE_KEYS.themeMode}')||'light';var d=m==='dark'||(m==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light';}catch(e){}})();`;
