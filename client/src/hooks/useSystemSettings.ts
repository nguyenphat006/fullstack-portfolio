"use client";

import { useQuery } from "@tanstack/react-query";
import { http } from "@/lib/api/axiosClient";
import { APP_CONFIG } from "@/config/app";
import type { Schemas } from "@/types/api";

export type PublicSystemSettings = Schemas["SystemSettingsPublic"];

export const SYSTEM_SETTINGS_KEY = ["system-settings"] as const;

export interface AppBranding {
  name: string;
  badge: string;
  tagline: string;
  owner: string;
  description: string;
  logoUrl: string | null;
  numberFormat: "INTL" | "VN";
  dateFormat: string;
}

/**
 * Nhận diện ứng dụng từ Cấu hình hệ thống (API công khai, cache 5 phút).
 * Khi API chưa trả / lỗi -> dùng `APP_CONFIG` làm giá trị dự phòng.
 */
export function useSystemSettings(): AppBranding & { isLoaded: boolean } {
  const { data } = useQuery({
    queryKey: [...SYSTEM_SETTINGS_KEY, "public"],
    queryFn: () => http.get<PublicSystemSettings>("/system-settings/public/"),
    staleTime: 5 * 60_000,
    retry: false,
  });
  return {
    isLoaded: Boolean(data),
    name: data?.app_name || APP_CONFIG.name,
    badge: data?.app_badge ?? APP_CONFIG.badge,
    tagline: data?.tagline ?? APP_CONFIG.tagline,
    owner: data?.company_name ?? APP_CONFIG.owner,
    description: APP_CONFIG.description,
    logoUrl: data?.logo_url || null,
    numberFormat: (data?.number_format as "INTL" | "VN") || "INTL",
    dateFormat: data?.date_format || "DD/MM/YYYY",
  };
}
