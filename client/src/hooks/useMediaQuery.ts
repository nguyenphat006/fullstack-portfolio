"use client";

import { useSyncExternalStore } from "react";

/** Theo dõi media query (vd. "(max-width: 1023px)"); server luôn trả `false` (giao diện desktop) để khớp hydrate */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
