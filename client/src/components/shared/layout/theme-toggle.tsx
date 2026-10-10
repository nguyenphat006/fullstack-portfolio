"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useLanding } from "@/content/provider";

/** Nút đổi sáng/tối. Chỉ hiện biểu tượng sau khi mount để tránh lệch hydrate. */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const { shared } = useLanding();
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- cờ "đã mount" chuẩn của next-themes
  useEffect(() => setMounted(true), []);

  const isDark = mounted ? resolvedTheme === "dark" : true;
  const label = `${shared.ui.theme.toggle}: ${isDark ? shared.ui.theme.light : shared.ui.theme.dark}`;

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={label}
      title={label}
      className={className}
    >
      {isDark ? <Sun className="size-full" aria-hidden /> : <Moon className="size-full" aria-hidden />}
    </button>
  );
}
