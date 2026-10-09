import type { AuditDiffItem } from "./types";

/** Giá trị một trường trong nhật ký: ưu tiên chữ backend dựng sẵn (`*_display`), rồi mới định dạng giá trị gốc */
export function auditValueText(value: unknown, display: string | null | undefined, labels: { yes: string; no: string }): string | null {
  if (display) return display;
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "boolean") return value ? labels.yes : labels.no;
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

/** Nhãn trường; dữ liệu cũ chưa có `label` thì dùng tên kỹ thuật */
export const auditFieldLabel = (d: AuditDiffItem) => d.label || d.field;
