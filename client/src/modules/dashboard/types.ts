import type { Schemas } from "@/types/api";

/** Số liệu trang Tổng quan — sinh từ OpenAPI (DashboardOverviewSerializer). Khối = null khi thiếu quyền. */
export type DashboardOverview = Schemas["DashboardOverview"];
export type DashboardKpi = Schemas["Kpi"];
export type ActivityPoint = Schemas["ActivityPoint"];
export type CategoryCount = Schemas["CategoryCount"];
export type RecentActivityItem = Schemas["RecentActivity"];
