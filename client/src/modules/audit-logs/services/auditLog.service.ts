import { http } from "@/lib/api/axiosClient";
import type { Paginated } from "@/lib/api/types";
import type { AuditLogFilterParams, AuditLogItem, AuditOptionsData } from "../types";

export const auditLogService = {
  /** Nhật ký thao tác (phân trang, lọc model, action, người dùng, khoảng ngày) */
  getAuditLogs: (params?: AuditLogFilterParams) => http.get<Paginated<AuditLogItem>>("/audit-logs/", { params }),

  /** Danh mục models và actions cố định cho bộ lọc */
  getAuditOptions: () => http.get<AuditOptionsData>("/audit-logs/options/"),

  getAuditLogById: (id: string) => http.get<AuditLogItem>(`/audit-logs/${id}/`),
};
