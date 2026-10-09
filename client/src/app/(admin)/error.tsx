"use client"; // Error boundary bắt buộc là Client Component

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { StatusPage } from "@/components/common";

/** Lỗi runtime ngoài khu vực dashboard (vd. trang đăng nhập). */
export default function RootError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const t = useTranslations("errors");
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusPage
      status="500"
      title={t("error.title")}
      subTitle={t("error.later")}
      onRetry={retry}
      fullScreen
    />
  );
}
