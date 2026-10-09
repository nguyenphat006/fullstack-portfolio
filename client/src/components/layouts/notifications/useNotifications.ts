"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { http } from "@/lib/api/axiosClient";
import type { Paginated } from "@/lib/api/types";
import type { Schemas } from "@/types/api";

export type NotificationItem = Schemas["Notification"];

const KEY = ["notifications"] as const;
const POLL_MS = 30_000;

/** Số chưa đọc — polling 30 giây, tự dừng khi tab trình duyệt ẩn */
export function useUnreadCount() {
  return useQuery({
    queryKey: [...KEY, "unread-count"],
    queryFn: () => http.get<{ count: number }>("/notifications/unread-count/"),
    refetchInterval: POLL_MS,
    refetchIntervalInBackground: false,
    staleTime: POLL_MS,
  });
}

/** 10 thông báo mới nhất — chỉ tải khi mở chuông */
export function useLatestNotifications(enabled: boolean) {
  return useQuery({
    queryKey: [...KEY, "latest"],
    queryFn: () => http.get<Paginated<NotificationItem>>("/notifications/", { params: { page_size: 10 } }),
    enabled,
    staleTime: 10_000,
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => http.post<NotificationItem>(`/notifications/${id}/read/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => http.post<{ count: number }>("/notifications/read-all/"),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export const fetchNewestUnread = () =>
  http.get<Paginated<NotificationItem>>("/notifications/", { params: { page_size: 1, unread: true } });
