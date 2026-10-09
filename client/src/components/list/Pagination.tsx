"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const PAGE_SIZES = [10, 20, 50, 100];

/** Dãy trang gọn: 1 … 4 5 6 … 20 */
function pageItems(current: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const items: (number | "gap")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) items.push("gap");
  for (let p = start; p <= end; p++) items.push(p);
  if (end < total - 1) items.push("gap");
  items.push(total);
  return items;
}

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number, pageSize: number) => void;
}

/** "N bản ghi" + số dòng / trang bên trái · số trang bên phải */
export function Pagination({ page, pageSize, total, onChange }: PaginationProps) {
  const t = useTranslations("list");
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="dt-pagination">
      <div className="flex items-center gap-3">
        <span className="text-muted-foreground tabular-nums">{t("pagination.total", { count: total })}</span>
        <Select value={String(pageSize)} onValueChange={(v) => onChange(1, Number(v))}>
          <SelectTrigger size="sm" className="w-[110px]" aria-label={t("pagination.pageSize")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZES.map((s) => (
              <SelectItem key={s} value={String(s)}>
                {t("pagination.perPage", { size: s })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <nav className="flex items-center gap-1" aria-label={t("pagination.nav")}>
        <Button variant="ghost" size="icon-sm" disabled={page <= 1} onClick={() => onChange(page - 1, pageSize)} aria-label={t("pagination.previous")}>
          <ChevronLeft />
        </Button>
        <span className="hidden items-center gap-1 sm:flex">
          {pageItems(page, pages).map((item, i) =>
            item === "gap" ? (
              <span key={`gap-${i}`} className="flex size-8 items-center justify-center text-muted-foreground">
                <MoreHorizontal className="size-4" />
              </span>
            ) : (
              <Button
                key={item}
                variant={item === page ? "outline" : "ghost"}
                size="sm"
                className={cn("min-w-8 px-2 tabular-nums", item === page && "border-primary text-primary")}
                onClick={() => onChange(item, pageSize)}
                aria-current={item === page ? "page" : undefined}
              >
                {item}
              </Button>
            ),
          )}
        </span>
        <span className="text-sm tabular-nums sm:hidden">
          {page}/{pages}
        </span>
        <Button variant="ghost" size="icon-sm" disabled={page >= pages} onClick={() => onChange(page + 1, pageSize)} aria-label={t("pagination.next")}>
          <ChevronRight />
        </Button>
      </nav>
    </div>
  );
}
