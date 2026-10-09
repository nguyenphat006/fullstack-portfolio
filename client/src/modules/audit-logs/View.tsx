"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StatusBadge, statusOptions } from "@/components/common/StatusBadge";
import { ListPage, defineColumns, remoteSource, useListState } from "@/components/list";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/constants/permissions";
import { userService } from "@/modules/users/services/user.service";
import { useAuditLogsQuery, useAuditOptionsQuery } from "./hooks/useAuditLogsQuery";
import { AuditDiffDrawer } from "./components/AuditDiffDrawer";
import { AUDIT_CSV_COLUMNS, downloadAuditCsv } from "./exportCsv";
import { AUDIT_ACTION_STATUS } from "./status";
import type { AuditLogItem } from "./types";

export function AuditLogsView() {
  const t = useTranslations("auditLogs");
  const tc = useTranslations("common");
  const tr = useTranslations();
  const { can } = usePermission();
  const list = useListState({ defaultOrdering: "-created_at" });
  const query = useAuditLogsQuery(list.params);
  const { data: options } = useAuditOptionsQuery();
  const [selected, setSelected] = useState<AuditLogItem | null>(null);

  const columns = useMemo(
    () =>
      defineColumns<AuditLogItem>([
        {
          key: "created_at",
          title: t("fields.time"),
          width: 160,
          pinned: "left",
          hideable: false,
          sortable: true,
          filter: { type: "date", params: ["date_from", "date_to"] },
          render: (v) => <span className="list-code">{v}</span>,
        },
        {
          key: "user",
          title: t("fields.user"),
          width: 170,
          ellipsis: true,
          filter: {
            type: "remote",
            param: "user",
            source: remoteSource({
              queryKey: ["users"],
              fetchPage: (p) => userService.list(p),
              toOption: (u) => ({ value: String(u.id), label: u.full_name || u.username, code: u.username }),
            }),
          },
          render: (_, r) => r.user?.full_name || r.user?.username || t("system"),
        },
        {
          key: "model_name",
          title: t("fields.model"),
          width: 200,
          sortable: true,
          ellipsis: true,
          filter: { type: "select", param: "model", options: options?.models ?? [] },
        },
        { key: "object_id", title: t("fields.record"), width: 100, align: "right", sortable: true, filter: { type: "text", param: "object_id" }, render: (v) => <span className="list-code">#{v}</span> },
        {
          key: "action_code",
          title: t("fields.action"),
          width: 120,
          sortable: true,
          filter: { type: "select", param: "action", options: statusOptions(AUDIT_ACTION_STATUS, tr) },
          render: (v) => <StatusBadge map={AUDIT_ACTION_STATUS} value={v} />,
        },
        {
          key: "diff",
          title: t("fields.changedFields"),
          width: 200,
          ellipsis: true,
          render: (_, r) => (r.action_code === "UPDATE" ? r.diff?.map((d) => d.field).join(", ") || null : null),
        },
        { key: "ip_address", title: t("fields.ip"), width: 130, defaultHidden: true },
        {
          key: "detail",
          title: t("fields.detail"),
          width: 80,
          align: "right",
          render: (_, r) => (
            <Button variant="link" size="sm" className="h-auto p-0" onClick={() => setSelected(r)}>
              {tc("actions.view")}
            </Button>
          ),
        },
      ]),
    [options, t, tc, tr],
  );

  return (
    <ListPage<AuditLogItem>
      moduleCode="AUDIT_LOGS"
      tableKey="audit-logs"
      list={list}
      query={query}
      columns={columns}
      entityLabel={t("entity")}
      searchPlaceholder={t("searchPlaceholder")}
      onExport={
        can(PERMISSIONS.AUDIT_LOGS.EXPORT)
          ? () => {
              const rows = query.data?.results ?? [];
              if (!rows.length) {
                toast.warning(t("export.empty"));
                return;
              }
              downloadAuditCsv(rows, AUDIT_CSV_COLUMNS.map((c) => t(`export.headers.${c}`)), t("export.fileName"));
              toast.success(t("export.done"));
            }
          : undefined
      }
    >
      <AuditDiffDrawer open={!!selected} onClose={() => setSelected(null)} logItem={selected} />
    </ListPage>
  );
}

export default AuditLogsView;
