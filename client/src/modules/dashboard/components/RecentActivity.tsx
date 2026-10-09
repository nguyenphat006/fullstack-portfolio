import React from "react";
import { useTranslations } from "next-intl";
import { StatusBadge, defineStatusMap } from "@/components/common/StatusBadge";
import { RelativeTime } from "@/components/list";
import type { RecentActivityItem } from "../types";

const ACTION = defineStatusMap({
  CREATE: { label: "auditLogs.actions.CREATE", tone: "success" },
  UPDATE: { label: "auditLogs.actions.UPDATE", tone: "info" },
  DELETE: { label: "auditLogs.actions.DELETE", tone: "error" },
});

/** 8 thao tác mới nhất: ai · làm gì · đối tượng · lúc nào */
export function RecentActivity({ items }: { items: RecentActivityItem[] }) {
  const t = useTranslations("dashboard");
  if (!items.length) return <p className="list-muted" style={{ margin: 0 }}>{t("noActivity")}</p>;
  return (
    <ul className="recent-activity">
      {items.map((item) => (
        <li key={item.id}>
          <StatusBadge map={ACTION} value={item.action_code} />
          <span className="recent-activity__text">
            <strong>{item.user}</strong> · {item.model_name}
            {item.object_id ? <span className="list-code"> #{item.object_id}</span> : null}
          </span>
          <RelativeTime value={item.created_at} />
        </li>
      ))}
    </ul>
  );
}
