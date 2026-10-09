import { defineStatusMap } from "@/components/common/StatusBadge";

/** Hành động nhật ký -> tông badge (dùng chung bảng, ngăn chi tiết, Tổng quan); nhãn là khóa chữ */
export const AUDIT_ACTION_STATUS = defineStatusMap({
  CREATE: { label: "auditLogs.actions.CREATE", tone: "success" },
  UPDATE: { label: "auditLogs.actions.UPDATE", tone: "info" },
  DELETE: { label: "auditLogs.actions.DELETE", tone: "error" },
  APPROVE: { label: "auditLogs.actions.APPROVE", tone: "accent" },
  RELEASE: { label: "auditLogs.actions.RELEASE", tone: "accent" },
  EXPORT: { label: "auditLogs.actions.EXPORT", tone: "neutral" },
  IMPORT: { label: "auditLogs.actions.IMPORT", tone: "neutral" },
});
