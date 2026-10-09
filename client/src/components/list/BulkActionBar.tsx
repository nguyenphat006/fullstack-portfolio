"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { MoreHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export interface BulkAction {
  key: string;
  label: string;
  icon?: React.ReactNode;
  danger?: boolean;
  /** Có câu hỏi xác nhận trước khi chạy (thao tác nguy hiểm). `title` dạng hàm nhận số dòng đã chọn (dùng với t()) */
  confirm?: { title: string | ((count: number) => string); content?: string; okText?: string };
  onClick: (ids: number[]) => Promise<unknown> | void;
}

interface BulkActionBarProps {
  count: number;
  actions: BulkAction[];
  onRun: (action: BulkAction) => void;
  onClear: () => void;
  busy?: boolean;
}

/** Thanh nổi đáy màn hình khi có dòng được chọn: "Đã chọn N" · thao tác · Bỏ chọn */
export function BulkActionBar({ count, actions, onRun, onClear, busy }: BulkActionBarProps) {
  const t = useTranslations("list");
  const tc = useTranslations("common");
  if (count === 0 || actions.length === 0) return null;
  const inline = actions.length > 3 ? actions.slice(0, 2) : actions;
  const overflow = actions.length > 3 ? actions.slice(2) : [];
  return (
    <div className="bulk-bar" role="toolbar" aria-label={t("bulk.toolbar")}>
      <span className="bulk-bar__count">{t("bulk.selected", { count })}</span>
      <span className="bulk-bar__divider" />
      <div className="bulk-bar__actions">
        {inline.map((a) => (
          <Button key={a.key} size="sm" variant="ghost" className={a.danger ? "text-destructive hover:text-destructive" : undefined} disabled={busy} onClick={() => onRun(a)}>
            {a.icon}
            {a.label}
          </Button>
        ))}
        {overflow.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon-sm" variant="ghost" aria-label={tc("actions.more")}>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {overflow.map((a) => (
                <DropdownMenuItem key={a.key} variant={a.danger ? "destructive" : "default"} onSelect={() => onRun(a)}>
                  {a.icon}
                  {a.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      <Button size="sm" variant="ghost" onClick={onClear}>
        <X />
        {t("bulk.clear")}
      </Button>
    </div>
  );
}
