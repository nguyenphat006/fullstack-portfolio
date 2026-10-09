"use client";

import { useQuery } from "@tanstack/react-query";
import { http } from "@/lib/api/axiosClient";
import type { Schemas } from "@/types/api";

export type SystemHealth = Schemas["HealthStatus"];

/** Trạng thái thật của hệ thống từ `GET /health/` (CSDL, cache), tự làm mới mỗi 60 giây. */
export function useSystemHealth() {
  return useQuery({
    queryKey: ["system-health"],
    queryFn: () => http.get<SystemHealth>("/health/"),
    refetchInterval: 60_000,
    retry: false,
  });
}
