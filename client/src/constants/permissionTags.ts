import type { StatusTone } from "@/components/common/StatusBadge";
import type { MessageKey } from "@/i18n/types";

export interface ActionMeta {
  code: string;
  /** Khóa chữ (settings.actions.*) — dịch lúc render */
  label: MessageKey;
  tone: StatusTone;
  order: number;
}

export const ACTION_CONFIGS: Record<string, ActionMeta> = {
  VIEW: {
    code: "VIEW",
    label: "settings.actions.VIEW",
    tone: "info",
    order: 1,
  },
  READ: {
    code: "READ",
    label: "settings.actions.READ",
    tone: "info",
    order: 2,
  },
  CREATE: {
    code: "CREATE",
    label: "settings.actions.CREATE",
    tone: "success",
    order: 3,
  },
  UPDATE: {
    code: "UPDATE",
    label: "settings.actions.UPDATE",
    tone: "warning",
    order: 4,
  },
  DELETE: {
    code: "DELETE",
    label: "settings.actions.DELETE",
    tone: "error",
    order: 5,
  },
  APPROVE: {
    code: "APPROVE",
    label: "settings.actions.APPROVE",
    tone: "accent",
    order: 6,
  },
  RELEASE: {
    code: "RELEASE",
    label: "settings.actions.RELEASE",
    tone: "accent",
    order: 7,
  },
  EXECUTE: {
    code: "EXECUTE",
    label: "settings.actions.EXECUTE",
    tone: "accent",
    order: 8,
  },
  EXPORT: {
    code: "EXPORT",
    label: "settings.actions.EXPORT",
    tone: "neutral",
    order: 9,
  },
  IMPORT: {
    code: "IMPORT",
    label: "settings.actions.IMPORT",
    tone: "neutral",
    order: 10,
  },
  CONFIG: {
    code: "CONFIG",
    label: "settings.actions.CONFIG",
    tone: "neutral",
    order: 11,
  },
};

/**
 * Trích xuất mã action từ chuỗi permission_code (Ví dụ: 'USER_CREATE' -> 'CREATE')
 */
export function getActionCode(permissionCode: string): string {
  if (!permissionCode) return "";
  const parts = permissionCode.split("_");
  return parts[parts.length - 1].toUpperCase();
}

/** Tông badge (StatusBadge) theo permission code hoặc action code */
export function getActionTone(permissionOrActionCode: string): StatusTone {
  if (!permissionOrActionCode) return "neutral";
  return ACTION_CONFIGS[getActionCode(permissionOrActionCode)]?.tone ?? "neutral";
}

/** Nhãn mô tả ngắn cho Action; `t` = `useTranslations()` (không namespace) của component gọi */
export function getActionLabel(permissionOrActionCode: string, t: (key: MessageKey) => string): string {
  if (!permissionOrActionCode) return "";
  const actionCode = getActionCode(permissionOrActionCode);
  const key = ACTION_CONFIGS[actionCode]?.label;
  return key ? t(key) : actionCode;
}

/**
 * Sắp xếp mảng permissions theo thứ tự logic chuẩn:
 * VIEW -> READ -> CREATE -> UPDATE -> DELETE -> APPROVE -> RELEASE -> EXECUTE -> EXPORT -> IMPORT -> CONFIG
 */
export function sortPermissionsByAction<T extends { permission_code: string }>(
  permissions: T[]
): T[] {
  if (!Array.isArray(permissions)) return [];
  return [...permissions].sort((a, b) => {
    const actA = getActionCode(a.permission_code);
    const actB = getActionCode(b.permission_code);
    const orderA = ACTION_CONFIGS[actA]?.order ?? 99;
    const orderB = ACTION_CONFIGS[actB]?.order ?? 99;

    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return a.permission_code.localeCompare(b.permission_code);
  });
}
