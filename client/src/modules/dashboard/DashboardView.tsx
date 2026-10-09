"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/common/PageHeader/PageHeader";
import { EmptyState } from "@/components/common/EmptyState/EmptyState";
import { useAuthStore } from "@/stores/useAuthStore";
import { useDashboardOverview } from "./hooks/useDashboardOverview";
import { KpiCard } from "./components/KpiCard";
import { ActivityChart } from "./components/ActivityChart";
import { CategoryChart } from "./components/CategoryChart";
import { RecentActivity } from "./components/RecentActivity";
import { SystemStatus } from "./components/SystemStatus";

function Panel({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`dash-panel ${className}`}>
      <h2 className="dash-panel__title">{title}</h2>
      {children}
    </section>
  );
}

/**
 * Trang Tổng quan mẫu: KPI → biểu đồ → hoạt động gần đây + trạng thái hệ thống.
 * Mọi số liệu từ 1 API (`/dashboard/overview/`); khối không có quyền (null) tự ẩn.
 * Thêm KPI cho module mới: backend `apps/dashboard/views.py` → KPI_BUILDERS.
 */
export function DashboardView() {
  const t = useTranslations("dashboard");
  const tc = useTranslations("common");
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, isError, refetch } = useDashboardOverview();
  const name = user?.full_name || user?.username || "";
  const hasCategoryChart = Boolean(data?.materials_by_category?.length);
  // Số cột KPI theo số khối thật sự có (bỏ module / thiếu quyền -> không để ô trống)
  const kpiCols = isLoading ? 4 : Math.min(Math.max(data?.kpis.length ?? 1, 1), 4);

  return (
    <div className="dashboard">
      <PageHeader title={t("title")} subtitle={name ? t("greeting", { name }) : undefined} />

      {isError ? (
        <EmptyState title={t("loadError")} description={t("loadErrorHint")} actionText={tc("actions.retry")} onAction={() => refetch()} actionType="default" icon={null} />
      ) : (
        <>
          <div className="dash-kpis" style={{ "--kpi-cols": kpiCols } as React.CSSProperties}>
            {isLoading
              ? Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="kpi-card">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="mt-2 h-8 w-20" />
                    <Skeleton className="mt-2 h-3 w-32" />
                  </div>
                ))
              : data?.kpis.map((kpi) => <KpiCard key={kpi.key} kpi={kpi} />)}
          </div>

          <div className="dash-grid">
            {(isLoading || data?.activity) && (
              <Panel title={t("panels.activity")} className={hasCategoryChart || isLoading ? "dash-grid__wide" : "dash-grid__full"}>
                {isLoading ? <Skeleton className="h-[240px] w-full" /> : <ActivityChart data={data!.activity!} />}
              </Panel>
            )}
            {hasCategoryChart && (
              <Panel title={t("panels.materialsByCategory")}>
                <CategoryChart data={data!.materials_by_category!} />
              </Panel>
            )}
            {data?.recent_activity && (
              <Panel title={t("panels.recentActivity")} className="dash-grid__wide">
                <RecentActivity items={data.recent_activity} />
              </Panel>
            )}
            <Panel title={t("panels.systemStatus")}>
              <SystemStatus />
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}

export default DashboardView;
