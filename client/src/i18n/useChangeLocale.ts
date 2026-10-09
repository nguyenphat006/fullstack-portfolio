"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { LOCALE_COOKIE, type AppLocale } from "./config";

/**
 * Đổi ngôn ngữ giao diện: ghi cookie -> render lại server (chữ mới) -> tải lại dữ liệu có chữ từ backend
 * (menu, thông báo lỗi, nhãn trạng thái) vì API trả theo Accept-Language.
 */
export function useChangeLocale() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const locale = useLocale();
  const [pending, startTransition] = useTransition();

  const changeLocale = (next: AppLocale) => {
    if (next === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    startTransition(() => {
      router.refresh();
      queryClient.invalidateQueries();
    });
  };

  return { locale, changeLocale, pending };
}
