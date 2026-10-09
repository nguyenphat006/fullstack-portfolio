"use client";

import React, { useEffect } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ConfirmProvider } from "@/components/feedback/confirm";
import { useThemeStore } from "@/stores/useThemeStore";
import { NumberFormatProvider } from "@/providers/NumberFormatProvider";

/** Provider chung của ứng dụng (shadcn/ui): theme, tooltip, thông báo nổi (sonner), hộp xác nhận, định dạng số. */
export default function AppProviders({ children }: { children: React.ReactNode }) {
  const hydrate = useThemeStore((s) => s.hydrate);
  const syncSystem = useThemeStore((s) => s.syncSystem);

  // Nạp lựa chọn theme đã lưu + theo dõi hệ điều hành đổi sáng / tối (chế độ "system")
  useEffect(() => {
    hydrate();
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", syncSystem);
    return () => media.removeEventListener("change", syncSystem);
  }, [hydrate, syncSystem]);

  return (
    <TooltipProvider delayDuration={300}>
      <ConfirmProvider>
        <NumberFormatProvider>{children}</NumberFormatProvider>
      </ConfirmProvider>
      <Toaster position="bottom-right" closeButton />
    </TooltipProvider>
  );
}
