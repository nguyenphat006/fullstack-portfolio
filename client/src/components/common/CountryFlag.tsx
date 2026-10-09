import React from "react";
import { cn } from "@/lib/utils";

/**
 * Cờ quốc gia theo mã ISO 3166-1 alpha-2 (thư viện `flag-icons`, SVG nằm trong gói — chỉ tải cờ đang hiển thị).
 * Không dùng emoji cờ: Windows hiện thành 2 chữ cái.
 */
export function CountryFlag({ code, className }: { code: string | null | undefined; className?: string }) {
  if (!code || !/^[A-Za-z]{2}$/.test(code)) return null;
  return <span className={cn("fi country-flag", `fi-${code.toLowerCase()}`, className)} aria-hidden />;
}
