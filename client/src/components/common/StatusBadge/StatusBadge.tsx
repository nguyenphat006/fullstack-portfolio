"use client";

import React from "react";
import { useTranslations } from "next-intl";
import type { MessageKey } from "@/i18n/types";

/**
 * Sắc thái màu của badge trạng thái — màu theo Ý NGHĨA, không theo từng trạng thái:
 * - success: tốt / đang dùng / đã xong   - info: đang diễn ra
 * - warning: cần chú ý / chờ xử lý        - error: lỗi / từ chối
 * - neutral: ngưng / nháp / đã hủy        - accent: đặc biệt (dùng hạn chế)
 */
export type StatusTone = "success" | "info" | "warning" | "error" | "neutral" | "accent";

export interface StatusDef {
  /** Khóa chữ tính từ gốc (vd "common.status.active") — dịch lúc render */
  label: MessageKey;
  tone: StatusTone;
}

export type StatusMap<K extends string = string> = Record<K, StatusDef>;

/** Khai báo bảng trạng thái của module; dùng chung cho badge và options bộ lọc. */
export function defineStatusMap<K extends string>(map: Record<K, StatusDef>): StatusMap<K> {
  return map;
}

/** Options cho Select / bộ lọc cột từ status map; `t` = `useTranslations()` (không namespace) của component gọi */
export function statusOptions(map: StatusMap, t: (key: MessageKey) => string): { label: string; value: string }[] {
  return Object.entries(map).map(([value, def]) => ({ value, label: t(def.label) }));
}

/** Trạng thái hoạt động dùng chung (`is_active`) */
export const ACTIVE_STATUS = defineStatusMap({
  true: { label: "common.status.active", tone: "success" },
  false: { label: "common.status.inactive", tone: "neutral" },
});

const TONE_COLOR: Record<StatusTone, string> = {
  success: "var(--c-success)",
  info: "var(--c-info)",
  warning: "var(--c-warning)",
  error: "var(--c-error)",
  neutral: "var(--c-text-secondary)",
  accent: "var(--c-purple)",
};

interface StatusBadgeByTone {
  tone: StatusTone;
  label: React.ReactNode;
  map?: never;
  value?: never;
}

interface StatusBadgeByMap {
  map: StatusMap;
  value: string | boolean | null | undefined;
  tone?: never;
  label?: never;
}

export type StatusBadgeProps = (StatusBadgeByTone | StatusBadgeByMap) & {
  style?: React.CSSProperties;
};

/** Badge trạng thái thống nhất: chấm màu + chữ trên nền nhạt cùng tông (tự đúng ở chế độ tối). */
export function StatusBadge(props: StatusBadgeProps) {
  const t = useTranslations();
  let tone: StatusTone;
  let label: React.ReactNode;
  if (props.map) {
    const def = props.map[String(props.value)];
    tone = def?.tone ?? "neutral";
    label = def ? t(def.label) : props.value == null ? "—" : String(props.value);
  } else {
    tone = props.tone;
    label = props.label;
  }
  const color = TONE_COLOR[tone];
  return (
    <span
      className="app-status-badge"
      style={{ "--badge-color": color, ...props.style } as React.CSSProperties}
    >
      <span className="app-status-badge__dot" aria-hidden />
      {label}
    </span>
  );
}

export default StatusBadge;
