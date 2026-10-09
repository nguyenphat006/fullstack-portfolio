import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

interface StatusPageProps {
  status: "403" | "404" | "500";
  title: string;
  subTitle: string;
  /** Nút "Thử lại" (trang lỗi) */
  onRetry?: () => void;
  /** Cao tối thiểu: toàn màn hình (ngoài layout) hoặc vùng nội dung (trong layout) */
  fullScreen?: boolean;
  /** Thay cụm nút mặc định (vd. "Về danh sách") */
  extra?: React.ReactNode;
}

/** Trang trạng thái dùng chung: 403 / 404 / lỗi hệ thống. */
export function StatusPage({ status, title, subTitle, onRetry, fullScreen = false, extra }: StatusPageProps) {
  const t = useTranslations("errors");
  const tc = useTranslations("common");
  return (
    <div className="flex items-center justify-center p-6" style={{ minHeight: fullScreen ? "100vh" : "60vh", background: fullScreen ? "var(--c-layout)" : undefined }}>
      <div className="flex max-w-md flex-col items-center text-center">
        <span className="text-6xl font-semibold tracking-tight text-muted-foreground/40 tabular-nums">{status}</span>
        <h1 className="mt-4 text-xl font-semibold text-foreground">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{subTitle}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {extra ?? (
            <>
              {onRetry && <Button onClick={onRetry}>{tc("actions.retry")}</Button>}
              <Button asChild variant={onRetry ? "outline" : "default"}>
                <Link href="/dashboard">{t("backHome")}</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default StatusPage;
