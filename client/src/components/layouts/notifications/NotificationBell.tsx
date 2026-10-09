"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Bell } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { RelativeTime } from "@/components/list/renderers";
import { downloadJobFile } from "@/lib/api/download";
import { cn } from "@/lib/utils";
import { fetchNewestUnread, useLatestNotifications, useMarkAllRead, useMarkRead, useUnreadCount, type NotificationItem } from "./useNotifications";

const LEVEL_COLOR: Record<string, string> = {
  INFO: "var(--c-info)",
  SUCCESS: "var(--c-success)",
  WARNING: "var(--c-warning)",
  ERROR: "var(--c-error)",
};

/** Liên kết ngoài app mở tab mới, còn lại điều hướng trong app */
function isExternal(link: string) {
  return /^https?:\/\//.test(link);
}

/** Chuông thông báo trên topbar: số chưa đọc, danh sách 10 mới nhất, báo nổi khi có kết quả mới */
export function NotificationBell() {
  const t = useTranslations("notifications");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { data: unread } = useUnreadCount();
  const { data: latest, isLoading } = useLatestNotifications(open);
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();
  const count = unread?.count ?? 0;

  // Có thông báo mới trong lúc đang dùng app -> báo nổi (chỉ loại thành công / lỗi)
  const lastCount = useRef<number | null>(null);
  useEffect(() => {
    if (unread === undefined) return;
    const previous = lastCount.current;
    lastCount.current = unread.count;
    if (previous === null || unread.count <= previous) return;
    fetchNewestUnread()
      .then((res) => {
        const item = res.results[0];
        if (!item || (item.level !== "SUCCESS" && item.level !== "ERROR")) return;
        (item.level === "SUCCESS" ? toast.success : toast.error)(item.title, { description: item.message ?? undefined, duration: 6000 });
      })
      .catch(() => undefined);
  }, [unread]);

  const openItem = (item: NotificationItem) => {
    if (!item.is_read) markRead.mutate(item.id);
    // Xuất dữ liệu xong -> tải tệp kết quả
    if (item.source_type === "DATA_TRANSFER_JOB" && item.level === "SUCCESS" && item.source_id) {
      setOpen(false);
      downloadJobFile(Number(item.source_id)).catch(() => toast.error(t("downloadFailed")));
      return;
    }
    if (!item.link) return;
    setOpen(false);
    if (isExternal(item.link)) window.open(item.link, "_blank", "noopener");
    else router.push(item.link);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-muted-foreground" aria-label={count ? t("ariaUnread", { count }) : t("title")}>
          <Bell />
          {count > 0 && (
            <span className="absolute top-1 right-1 flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-4 font-semibold text-white tabular-nums">
              {count > 99 ? "99+" : count}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="notif-panel p-0">
        <div className="notif-panel__head">
          <span>{t("title")}</span>
          {count > 0 && (
            <Button variant="link" size="xs" className="h-auto p-0" onClick={() => markAll.mutate()} disabled={markAll.isPending}>
              {t("markAllRead")}
            </Button>
          )}
        </div>
        <div className="notif-panel__list">
          {isLoading ? (
            <div className="space-y-2 p-3">
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !latest?.results.length ? (
            <p className="notif-panel__empty">{t("empty")}</p>
          ) : (
            latest.results.map((item) => (
              <button key={item.id} type="button" className={cn("notif-item", !item.is_read && "is-unread")} onClick={() => openItem(item)}>
                <span className="notif-item__dot" style={{ background: LEVEL_COLOR[item.level] ?? LEVEL_COLOR.INFO }} />
                <span className="notif-item__body">
                  <span className="notif-item__title">{item.title}</span>
                  {item.message && <span className="notif-item__message">{item.message}</span>}
                  <RelativeTime value={item.created_at} />
                </span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
