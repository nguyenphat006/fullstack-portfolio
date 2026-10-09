"use client";

import { useMemo } from "react";
import { useThemeStore } from "@/stores/useThemeStore";

/**
 * Đọc giá trị thật của biến CSS (`--c-*`) theo giao diện hiện tại — dùng cho thư viện vẽ (recharts, canvas)
 * không nhận `var(...)`. Tự đọc lại khi đổi sáng / tối.
 */
export function useCssVars<K extends string>(names: readonly K[]): Record<K, string> {
  const resolved = useThemeStore((s) => s.resolved);
  const key = names.join(",");
  return useMemo(() => {
    const out = {} as Record<K, string>;
    const style = typeof window !== "undefined" ? getComputedStyle(document.documentElement) : null;
    for (const name of names) out[name] = style?.getPropertyValue(name).trim() || "#94A3B8";
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolved, key]);
}
