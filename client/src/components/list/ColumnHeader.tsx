"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowDown, ArrowUp, ListFilter, Pin } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ColumnFilterPanel } from "./ColumnFilterPanel";
import { isFilterActive } from "./filters";
import type { ListColumn } from "./types";
import type { PinSide } from "./useListPreferences";

export interface ColumnHeaderProps<T> {
  column: ListColumn<T>;
  /** Trường `ordering` của cột, null = không sắp xếp được */
  sortField: string | null;
  ordering: string | null;
  onSort: (ordering: string | null) => void;
  filters: Record<string, string>;
  onFilter: (patch: Record<string, string | null>) => void;
  pin: PinSide;
  onPin: (side: PinSide) => void;
}

/**
 * Tiêu đề cột chỉ tập trung vào sắp xếp + lọc / tìm:
 * - bấm tiêu đề: xoay vòng sắp xếp (tăng → giảm → bỏ);
 * - icon phễu (cột có `filter`): popover gồm hàng icon ghim trái / phải · mỗi dòng một kiểu sắp xếp (Tăng dần / Giảm dần) · ô lọc / tìm của cột.
 * Đổi thứ tự, ẩn cột, mật độ nằm ở nút ⚙ (TableSettings).
 */
export function ColumnHeader<T>({ column, sortField, ordering, onSort, filters, onFilter, pin, onPin }: ColumnHeaderProps<T>) {
  const t = useTranslations("list");
  const [open, setOpen] = useState(false);
  const sortDir = sortField && ordering === sortField ? "asc" : sortField && ordering === `-${sortField}` ? "desc" : null;
  const filtered = isFilterActive(column, filters);

  const cycleSort = () => {
    if (!sortField) return;
    onSort(sortDir === null ? sortField : sortDir === "asc" ? `-${sortField}` : null);
  };
  const setSort = (dir: "asc" | "desc") => {
    if (!sortField) return;
    onSort(sortDir === dir ? null : dir === "asc" ? sortField : `-${sortField}`);
  };

  return (
    <div className={cn("list-th", column.align === "right" && "list-th--right")}>
      {sortField ? (
        <button type="button" className="list-th__label" onClick={cycleSort} title={t("column.sortHint")}>
          <span className="list-th__text">{column.title}</span>
          <span className={cn("list-th__sort", sortDir && "is-active")} aria-hidden>
            {sortDir === "desc" ? <ArrowDown className="size-3.5" /> : <ArrowUp className="size-3.5" />}
          </span>
        </button>
      ) : (
        <span className="list-th__label list-th__label--static">
          <span className="list-th__text">{column.title}</span>
        </span>
      )}
      {column.filter && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn("list-th__filter", (open || filtered) && "is-visible", filtered && "is-active")}
              aria-label={t("column.filterColumn", { column: column.title })}
            >
              <ListFilter className="size-3.5" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" collisionPadding={12} className="w-80 p-2">
            <div className="list-th__tools">
              <IconToggle label={pin === "left" ? t("column.unpin") : t("column.pinLeft")} active={pin === "left"} onClick={() => onPin(pin === "left" ? false : "left")}>
                <Pin className={cn(pin === "left" && "fill-current")} />
              </IconToggle>
              <IconToggle label={pin === "right" ? t("column.unpin") : t("column.pinRight")} active={pin === "right"} onClick={() => onPin(pin === "right" ? false : "right")}>
                <Pin className={cn("rotate-90", pin === "right" && "fill-current")} />
              </IconToggle>
            </div>
            {sortField && (
              <div className="list-th__sort-group">
                <button type="button" className={cn("list-th__sort-btn", sortDir === "asc" && "is-active")} aria-pressed={sortDir === "asc"} onClick={() => setSort("asc")}>
                  <ArrowUp /> {t("column.sortAsc")}
                </button>
                <button type="button" className={cn("list-th__sort-btn", sortDir === "desc" && "is-active")} aria-pressed={sortDir === "desc"} onClick={() => setSort("desc")}>
                  <ArrowDown /> {t("column.sortDesc")}
                </button>
              </div>
            )}
            <ColumnFilterPanel
              column={column}
              filters={filters}
              onApply={(patch) => {
                onFilter(patch);
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

/** Nút icon bật / tắt có tooltip (hàng công cụ trong popover cột) */
function IconToggle({ label, active, onClick, children }: { label: string; active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" className={cn("list-th__tool", active && "is-active")} aria-label={label} aria-pressed={active} onClick={onClick}>
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
