"use client";

import React from "react";
import { useLocale, useTranslations } from "next-intl";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useSystemHealth } from "@/hooks/useSystemHealth";

type Component = { status: string; latency_ms?: number } | undefined;

/** Trạng thái thật từ GET /health/ (tự làm mới 60 giây, dừng khi tab ẩn) */
export function SystemStatus() {
  const t = useTranslations("dashboard.system");
  const locale = useLocale();
  const { data, isLoading, isError, dataUpdatedAt } = useSystemHealth();

  const badge = (state: Component) => {
    if (isLoading) return <StatusBadge tone="neutral" label={t("checking")} />;
    if (isError || !state) return <StatusBadge tone="error" label={t("unreachable")} />;
    return state.status === "ok" ? (
      <StatusBadge tone="success" label={state.latency_ms !== undefined ? t("okLatency", { ms: state.latency_ms }) : t("ok")} />
    ) : (
      <StatusBadge tone="error" label={t("error")} />
    );
  };

  const rows: { label: string; value: React.ReactNode }[] = [
    { label: t("api"), value: badge(data ? { status: "ok" } : undefined) },
    { label: t("database"), value: badge(data?.database) },
    { label: t("cache"), value: badge(data?.cache) },
    { label: t("version"), value: <span className="list-code">{data?.version ?? "—"}</span> },
  ];

  return (
    <div className="system-status">
      {rows.map((row) => (
        <div key={row.label} className="system-status__row">
          <span>{row.label}</span>
          {row.value}
        </div>
      ))}
      {dataUpdatedAt > 0 && (
        <span className="list-muted" style={{ fontSize: 12 }}>
          {t("updatedAt", { time: new Date(dataUpdatedAt).toLocaleTimeString(locale === "vi" ? "vi-VN" : "en-GB") })}
        </span>
      )}
    </div>
  );
}
