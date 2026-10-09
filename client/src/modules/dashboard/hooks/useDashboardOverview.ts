"use client";

import { useQuery } from "@tanstack/react-query";
import { http } from "@/lib/api/axiosClient";
import type { DashboardOverview } from "../types";

/** 1 request cho toàn bộ trang Tổng quan (backend cache 60 giây theo user). */
export function useDashboardOverview() {
  return useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: () => http.get<DashboardOverview>("/dashboard/overview/"),
    staleTime: 60_000,
  });
}
