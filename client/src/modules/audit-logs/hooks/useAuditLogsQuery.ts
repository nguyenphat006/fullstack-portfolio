"use client";

import { useQuery } from "@tanstack/react-query";
import { auditLogService } from "../services/auditLog.service";
import type { AuditLogFilterParams } from "../types";

export const AUDIT_LOG_QUERY_KEYS = {
  all: ["audit-logs"] as const,
  list: (params?: AuditLogFilterParams) => [...AUDIT_LOG_QUERY_KEYS.all, "list", params] as const,
  options: () => [...AUDIT_LOG_QUERY_KEYS.all, "options"] as const,
  detail: (id: string) => [...AUDIT_LOG_QUERY_KEYS.all, "detail", id] as const,
};

/** Hook lấy danh sách nhật ký thao tác */
export function useAuditLogsQuery(params?: AuditLogFilterParams) {
  return useQuery({
    queryKey: AUDIT_LOG_QUERY_KEYS.list(params),
    queryFn: () => auditLogService.getAuditLogs(params),
    staleTime: 1000 * 10, // 10s
  });
}

/** Hook lấy tùy chọn bộ lọc (danh mục models, actions) */
export function useAuditOptionsQuery() {
  return useQuery({
    queryKey: AUDIT_LOG_QUERY_KEYS.options(),
    queryFn: () => auditLogService.getAuditOptions(),
    staleTime: 1000 * 60 * 10, // 10 phút
  });
}
