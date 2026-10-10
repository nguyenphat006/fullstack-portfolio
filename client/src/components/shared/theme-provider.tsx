"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/** Light/dark cho landing: class `.dark` trên <html>, mặc định tối (đúng thiết kế gốc), cho phép "theo hệ thống". */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange storageKey="landing-theme">
      {children}
    </NextThemesProvider>
  );
}
