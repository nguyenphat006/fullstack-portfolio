"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";

export type TableDensity = "large" | "middle" | "small";
export type PinSide = "left" | "right" | false;

export interface ListPreferences {
  density: TableDensity;
  /** Thứ tự key cột người dùng đã sắp */
  order: string[];
  /** Ghi đè ẩn / hiện so với mặc định của cột */
  visibility: Record<string, boolean>;
  pinned: Record<string, PinSide>;
  widths: Record<string, number>;
}

const DEFAULTS: ListPreferences = { density: "middle", order: [], visibility: {}, pinned: {}, widths: {} };

function read(key: string | null): ListPreferences {
  if (!key || typeof window === "undefined") return DEFAULTS;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || "null");
    return parsed ? { ...DEFAULTS, ...parsed } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

/** Cấu hình bảng (thứ tự, ẩn / hiện, ghim, độ rộng, mật độ) theo user + tableKey, lưu localStorage. */
export function useListPreferences(tableKey: string) {
  const userId = useAuthStore((s) => s.user?.id);
  const storageKey = userId ? `list_pref_${userId}_${tableKey}` : null;
  const [prefs, setPrefs] = useState<ListPreferences>(DEFAULTS);

  // Đọc sau khi mount (lần render đầu giống server)
  useEffect(() => {
    setPrefs(read(storageKey)); // eslint-disable-line react-hooks/set-state-in-effect
  }, [storageKey]);

  const update = useCallback(
    (patch: Partial<ListPreferences> | ((prev: ListPreferences) => Partial<ListPreferences>)) => {
      setPrefs((prev) => {
        const next = { ...prev, ...(typeof patch === "function" ? patch(prev) : patch) };
        if (storageKey) {
          try {
            window.localStorage.setItem(storageKey, JSON.stringify(next));
          } catch {
            // bỏ qua khi localStorage bị chặn
          }
        }
        return next;
      });
    },
    [storageKey],
  );

  const reset = useCallback(() => {
    if (storageKey) {
      try {
        window.localStorage.removeItem(storageKey);
      } catch {
        // bỏ qua
      }
    }
    setPrefs(DEFAULTS);
  }, [storageKey]);

  const isCustomized =
    prefs.order.length > 0 ||
    Object.keys(prefs.visibility).length > 0 ||
    Object.keys(prefs.pinned).length > 0 ||
    Object.keys(prefs.widths).length > 0 ||
    prefs.density !== DEFAULTS.density;

  return { prefs, update, reset, isCustomized };
}

export type ListPreferencesApi = ReturnType<typeof useListPreferences>;
