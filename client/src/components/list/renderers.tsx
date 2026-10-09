"use client";

import React from "react";
import { useLocale } from "next-intl";
import { readClientLocale } from "@/i18n/config";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/** Đọc "dd/mm/yyyy HH:MM" (serializer backend) hoặc ISO */
export function parseDateTime(value: string | null | undefined): Date | null {
  if (!value) return null;
  const m = value.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}))?/);
  if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]), Number(m[4] ?? 0), Number(m[5] ?? 0));
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

const pad = (n: number) => String(n).padStart(2, "0");

export function formatDateTime(date: Date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())} ${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

/** "2 giờ trước" / "2 hours ago" theo ngôn ngữ (mặc định: ngôn ngữ đang chọn ở trình duyệt); quá 7 ngày -> dd/mm/yyyy */
export function formatRelative(date: Date, now = new Date(), locale: string = readClientLocale()): string {
  const diff = Math.round((now.getTime() - date.getTime()) / 1000);
  if (diff >= 86400 * 7) return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  if (diff < 60) return rtf.format(0, "second");
  if (diff < 3600) return rtf.format(-Math.floor(diff / 60), "minute");
  if (diff < 86400) return rtf.format(-Math.floor(diff / 3600), "hour");
  return rtf.format(-Math.floor(diff / 86400), "day");
}

/** Thời gian tương đối ("2 giờ trước"); Tooltip giờ đầy đủ + người thực hiện */
export function RelativeTime({ value, by }: { value: string | null | undefined; by?: string | null }) {
  const locale = useLocale();
  const date = parseDateTime(value);
  if (!date) return <span className="list-empty-value">—</span>;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="list-muted">{formatRelative(date, new Date(), locale)}</span>
      </TooltipTrigger>
      <TooltipContent>{`${formatDateTime(date)}${by ? ` · ${by}` : ""}`}</TooltipContent>
    </Tooltip>
  );
}

/** Mã bản ghi: chữ monospace, không dùng badge màu */
export function CodeText({ children }: { children: React.ReactNode }) {
  return <span className="list-code">{children}</span>;
}
