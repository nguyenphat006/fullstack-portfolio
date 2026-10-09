"use client";

import React, { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Download, Eye, Loader2, Pencil, Plus, Trash2, Upload, Zap, type LucideIcon } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState/EmptyState";
import { auditLogService } from "@/modules/audit-logs/services/auditLog.service";
import { AuditDiffDrawer } from "@/modules/audit-logs/components/AuditDiffDrawer";
import { AUDIT_ACTION_STATUS } from "@/modules/audit-logs/status";
import { auditFieldLabel, auditValueText } from "@/modules/audit-logs/format";
import type { AuditLogItem } from "@/modules/audit-logs/types";

const PAGE_SIZE = 20;

export interface EntityAuditTabProps {
  /** Model pghistory, vd. "master_data.material", "authentication.customuser" */
  model: string;
  objectId: number;
}

/** Ô "Nội dung thay đổi": mỗi trường một dòng — nhãn trường · giá trị cũ → giá trị mới */
function Changes({ log }: { log: AuditLogItem }) {
  const tc = useTranslations("common");
  const yesNo = { yes: tc("status.yes"), no: tc("status.no") };
  if (!log.diff?.length) return null;
  return (
    <ul className="audit-changes">
      {log.diff.map((d) => {
        const before = auditValueText(d.old_value, d.old_display, yesNo);
        const after = auditValueText(d.new_value, d.new_display, yesNo);
        return (
          <li key={d.field}>
            <span className="audit-changes__field">{auditFieldLabel(d)}</span>
            {before !== null && log.action_code !== "CREATE" && (
              <>
                <span className="audit-changes__old">{before}</span>
                <span className="audit-changes__arrow" aria-hidden>
                  →
                </span>
              </>
            )}
            <span className="audit-changes__new">{after ?? "—"}</span>
          </li>
        );
      })}
    </ul>
  );
}

/** Thao tác → icon + màu của mốc trên dòng thời gian (thay cho badge) */
const ACTION_ICON: Record<string, { icon: LucideIcon; color: string }> = {
  CREATE: { icon: Plus, color: "var(--c-success)" },
  UPDATE: { icon: Pencil, color: "var(--c-primary)" },
  DELETE: { icon: Trash2, color: "var(--c-error)" },
  IMPORT: { icon: Upload, color: "var(--c-info)" },
  EXPORT: { icon: Download, color: "var(--c-info)" },
};
const OTHER_ACTION = { icon: Zap, color: "var(--c-purple)" };

/**
 * Tab "Nhật ký" dùng chung của trang chi tiết: dòng thời gian nhóm theo ngày, các mục nối nhau.
 * Mỗi mục: người thực hiện + vai trò · thao tác · phân hệ · giờ, và **toàn bộ** trường thay đổi (cũ → mới) hiện sẵn.
 * "Xem chi tiết" chỉ để xem thông tin kỹ thuật (IP, thiết bị, dữ liệu toàn phần). "Tải thêm" theo trang.
 */
export function EntityAuditTab({ model, objectId }: EntityAuditTabProps) {
  const t = useTranslations("detail");
  const tc = useTranslations("common");
  const tr = useTranslations();
  const [selected, setSelected] = useState<AuditLogItem | null>(null);
  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["audit-logs", "entity", model, objectId],
    queryFn: ({ pageParam }) => auditLogService.getAuditLogs({ model, object_id: objectId, page: pageParam, page_size: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (last, pages) => (last.next ? pages.length + 1 : undefined),
    staleTime: 30_000,
  });

  // Nhóm theo ngày; bỏ các lần cập nhật chỉ đổi trường kỹ thuật (thời điểm cập nhật, lần đăng nhập…)
  const groups = useMemo(() => {
    const map = new Map<string, AuditLogItem[]>();
    for (const log of data?.pages.flatMap((p) => p.results) ?? []) {
      if (log.action_code === "UPDATE" && !log.diff?.length) continue;
      const day = (log.created_at || "").split(" ")[0] || "—";
      map.set(day, [...(map.get(day) ?? []), log]);
    }
    return [...map.entries()];
  }, [data]);

  if (isLoading)
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-16 w-full max-w-3xl" />
        ))}
      </div>
    );
  if (isError) return <EmptyState title={t("audit.loadError")} actionText={tc("actions.retry")} onAction={() => refetch()} actionType="default" icon={null} />;
  if (!groups.length && !hasNextPage) return <EmptyState title={t("audit.empty")} description={t("audit.emptyHint")} />;

  return (
    <div className="audit-timeline">
      {groups.map(([day, items]) => (
        <section key={day} className="audit-timeline__day">
          <div className="audit-timeline__date">{day}</div>
          {items.map((log) => {
            const roles = log.user?.roles ?? [];
            const { icon: Icon, color } = ACTION_ICON[log.action_code] ?? OTHER_ACTION;
            const def = AUDIT_ACTION_STATUS[log.action_code as keyof typeof AUDIT_ACTION_STATUS];
            const actionText = def ? tr(def.label) : log.action_label || log.action_code;
            return (
              <div key={log.id} className="audit-timeline__item">
                <span className="audit-timeline__dot" style={{ "--dot-color": color } as React.CSSProperties} title={actionText} role="img" aria-label={actionText}>
                  <Icon />
                </span>
                <div className="audit-timeline__body">
                  <div className="audit-timeline__head">
                    <div className="audit-timeline__who">
                      <strong>{log.user?.id ? log.user.full_name || log.user.username : t("audit.system")}</strong>
                      {roles.map((r) => (
                        <span key={r} className="audit-roles__item">
                          {r}
                        </span>
                      ))}
                    </div>
                    <span className="audit-timeline__time">{(log.created_at || "").split(" ")[1]?.slice(0, 5)}</span>
                  </div>
                  <div className="audit-timeline__meta">
                    <span className="audit-timeline__action" style={{ color }}>
                      {actionText}
                    </span>
                    <span aria-hidden>·</span>
                    <span className="audit-timeline__module">{log.model_name}</span>
                  </div>
                  <Changes log={log} />
                  <Button variant="link" size="xs" className="h-auto p-0" onClick={() => setSelected(log)}>
                    <Eye /> {tc("actions.viewDetail")}
                  </Button>
                </div>
              </div>
            );
          })}
        </section>
      ))}
      {hasNextPage && (
        <Button variant="outline" className="self-start" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage && <Loader2 className="animate-spin" />}
          {t("audit.loadMore")}
        </Button>
      )}
      <AuditDiffDrawer open={!!selected} onClose={() => setSelected(null)} logItem={selected} />
    </div>
  );
}
