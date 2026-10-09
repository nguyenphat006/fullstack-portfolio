import React from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { DashboardKpi } from "../types";

/** Thẻ KPI gọn: nhãn · số lớn · thay đổi so với kỳ trước. Có `href` thì cả thẻ là link. */
export function KpiCard({ kpi }: { kpi: DashboardKpi }) {
  const up = kpi.delta > 0;
  const down = kpi.delta < 0;
  const body = (
    <>
      <span className="kpi-card__label">{kpi.label}</span>
      <span className="kpi-card__value">{kpi.value.toLocaleString("vi-VN")}</span>
      <span className="kpi-card__hint">
        {(up || down) && (
          <span className={`kpi-card__delta ${up ? "is-up" : "is-down"}`}>
            {up ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
            {Math.abs(kpi.delta).toLocaleString("vi-VN")}
          </span>
        )}
        {!up && !down && <span className="kpi-card__delta">0</span>}
        {kpi.hint}
      </span>
    </>
  );
  return kpi.href ? (
    <Link href={kpi.href} className="kpi-card kpi-card--link">
      {body}
    </Link>
  ) : (
    <div className="kpi-card">{body}</div>
  );
}
