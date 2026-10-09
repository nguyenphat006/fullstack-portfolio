"use client";

import { useEffect, useRef } from "react";

/**
 * Gắn phím tắt toàn cục dạng "mod+k" (mod = Ctrl trên Windows/Linux, ⌘ trên macOS).
 * Handler luôn là bản mới nhất, không cần bọc useCallback.
 */
export function useHotkey(combo: string, handler: (event: KeyboardEvent) => void, enabled = true) {
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    if (!enabled) return;
    const parts = combo.toLowerCase().split("+");
    const key = parts[parts.length - 1];
    const needMod = parts.includes("mod");
    const needShift = parts.includes("shift");

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== key) return;
      if (needMod && !(event.ctrlKey || event.metaKey)) return;
      if (needShift !== event.shiftKey) return;
      event.preventDefault();
      handlerRef.current(event);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [combo, enabled]);
}
