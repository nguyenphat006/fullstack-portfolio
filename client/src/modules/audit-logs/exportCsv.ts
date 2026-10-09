import type { AuditLogItem } from "./types";

/** Thứ tự cột CSV = khóa chữ `auditLogs.export.headers.<cột>` (tiêu đề theo ngôn ngữ đang chọn) */
export const AUDIT_CSV_COLUMNS = ["id", "time", "user", "username", "model", "objectId", "action", "method", "ip", "url"] as const;

const cell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

/**
 * Xuất các dòng nhật ký đang hiển thị ra CSV (UTF-8 BOM để Excel đọc đúng tiếng Việt).
 * `headers` (theo AUDIT_CSV_COLUMNS) và `fileName` do nơi gọi truyền theo ngôn ngữ đang chọn.
 */
export function downloadAuditCsv(rows: AuditLogItem[], headers: string[], fileName: string) {
  const lines = rows.map((log) =>
    [
      log.id,
      log.created_at,
      log.user?.full_name,
      log.user?.username,
      log.model_name,
      `#${log.object_id ?? ""}`,
      log.action_label || log.action_code,
      log.http_method,
      log.ip_address,
      log.url,
    ]
      .map(cell)
      .join(","),
  );
  const blob = new Blob(["﻿" + [headers.map(cell).join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
