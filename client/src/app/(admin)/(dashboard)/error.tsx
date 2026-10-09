"use client"; // Error boundary bắt buộc là Client Component

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { StatusPage } from "@/components/common";

/** Lỗi runtime trong khu vực đã đăng nhập — giữ nguyên sidebar/topbar, cho phép thử lại. */
export default function DashboardError({
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
      subTitle={error.digest ? t("error.withCode", { code: error.digest }) : t("error.hint")}
      onRetry={retry}
    />
  );
}
