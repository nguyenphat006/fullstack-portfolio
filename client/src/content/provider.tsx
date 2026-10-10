"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { localizePath, type Locale } from "./locales";
import type { LandingContent } from "./index";

type LandingContextValue = LandingContent & {
  /** Đường dẫn nội bộ theo ngôn ngữ hiện tại: path("/blog") -> "/blog" (vi) hoặc "/en/blog" (en). */
  path: (href: string) => string;
};

const LandingContext = createContext<LandingContextValue | null>(null);

export function LandingProvider({ content, children }: { content: LandingContent; children: ReactNode }) {
  const value = useMemo<LandingContextValue>(
    () => ({ ...content, path: (href: string) => localizePath(content.locale, href) }),
    [content],
  );
  return <LandingContext.Provider value={value}>{children}</LandingContext.Provider>;
}

/** Nội dung + ngôn ngữ hiện tại cho client component của landing. */
export function useLanding(): LandingContextValue {
  const ctx = useContext(LandingContext);
  if (!ctx) throw new Error("useLanding phải nằm trong <LandingProvider>");
  return ctx;
}

export type { Locale };
