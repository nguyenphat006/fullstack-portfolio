"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Download, Filter, RefreshCw, Search, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FilterField } from "./ColumnFilterPanel";
import { clearFilterPatch, filterTagText, isFilterActive, readFilter, writeFilter, type FilterValue } from "./filters";
import type { ListColumn } from "./types";
import type { ListState } from "./useListState";

/** Ô tìm kiếm có debounce, đồng bộ lại khi URL đổi từ nơi khác (Xóa lọc, quay lại) */
function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  const t = useTranslations("list");
  const [text, setText] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => setText(value), [value]); // eslint-disable-line react-hooks/set-state-in-effect
  const change = (v: string) => {
    setText(v);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onChange(v), v ? 300 : 0);
  };
  return (
    <div className="filter-bar__search relative">
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input value={text} onChange={(e) => change(e.target.value)} placeholder={placeholder} aria-label={placeholder} className="pr-8 pl-8" />
      {text && (
        <button type="button" onClick={() => change("")} aria-label={t("filter.clearKeyword")} className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

/**
 * Nút "Bộ lọc" chung: panel hiện mọi bộ lọc của các cột dạng form, áp dụng một lần.
 * Cùng trạng thái URL với icon phễu trên header cột → hai nơi luôn đồng bộ.
 */
function FilterPanel<T>({ columns, list }: { columns: ListColumn<T>[]; list: ListState }) {
  const t = useTranslations("list");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Record<string, FilterValue>>({});
  const filterable = columns.filter((c) => c.filter);
  const activeCount = filterable.filter((c) => isFilterActive(c, list.filters)).length;
  if (!filterable.length) return null;

  const openChange = (v: boolean) => {
    if (v) setDraft(Object.fromEntries(filterable.map((c) => [c.key, readFilter(c, list.filters)])));
    setOpen(v);
  };
  const patchOf = (values: Record<string, FilterValue>) =>
    Object.assign({}, ...filterable.map((c) => writeFilter(c, values[c.key] ?? null))) as Record<string, string | null>;
  const apply = () => {
    list.setFilters(patchOf(draft));
    setOpen(false);
  };
  const clear = () => {
    list.setFilters(patchOf({}));
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={openChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" aria-label={t("filter.filters")} className={activeCount > 0 ? "filter-bar__filter is-active" : "filter-bar__filter"}>
          <Filter />
          <span className="filter-bar__filter-text">{t("filter.filters")}</span>
          {activeCount > 0 && <span className="rounded-full bg-primary px-1.5 text-xs leading-5 text-primary-foreground">{activeCount}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[min(620px,calc(100vw-2rem))] p-0">
        <div className="filter-panel__body">
          {filterable.map((col) => (
            <div key={col.key} className="filter-panel__row">
              <span className="filter-panel__label">{col.title}</span>
              <FilterField column={col} value={draft[col.key] ?? null} onChange={(v) => setDraft((d) => ({ ...d, [col.key]: v }))} onEnter={apply} />
            </div>
          ))}
        </div>
        <div className="filter-panel__footer">
          <Button size="sm" variant="ghost" onClick={clear} disabled={activeCount === 0}>
            {t("filter.clearPanel")}
          </Button>
          <Button size="sm" onClick={apply}>
            {t("filter.applyAll")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** Nút icon có tooltip trên thanh công cụ */
function ToolbarIcon({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="icon" onClick={onClick} aria-label={label}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export interface FilterBarProps<T> {
  list: ListState;
  columns: ListColumn<T>[];
  searchPlaceholder: string;
  onRefresh: () => void;
  refreshing: boolean;
  onExport?: () => void;
  onImport?: () => void;
  /** Nút ⚙ cấu hình bảng */
  settings?: React.ReactNode;
}

/**
 * Thanh công cụ nằm trong khối bảng: tìm kiếm chung · "Bộ lọc" chung · tag bộ lọc · ⟳ · Xuất · Nhập (nút có chữ) · ⚙.
 * Lọc / tìm từng cột ở icon phễu trên header — cùng trạng thái URL với "Bộ lọc" nên luôn đồng bộ.
 */
export function FilterBar<T>({ list, columns, searchPlaceholder, onRefresh, refreshing, onExport, onImport, settings }: FilterBarProps<T>) {
  const tc = useTranslations("common");
  return (
    <div className="filter-bar">
      <div className="filter-bar__left">
        <SearchInput value={list.search} onChange={list.setSearch} placeholder={searchPlaceholder} />
        <FilterPanel columns={columns} list={list} />
        <FilterTags list={list} columns={columns} />
      </div>
      <div className="filter-bar__right">
        <ToolbarIcon label={tc("actions.refresh")} onClick={onRefresh}>
          <RefreshCw className={refreshing ? "animate-spin" : undefined} />
        </ToolbarIcon>
        {onExport && (
          <Button variant="outline" onClick={onExport} aria-label={tc("actions.export")}>
            <Download />
            <span className="filter-bar__btn-text">{tc("actions.export")}</span>
          </Button>
        )}
        {onImport && (
          <Button variant="outline" onClick={onImport} aria-label={tc("actions.import")}>
            <Upload />
            <span className="filter-bar__btn-text">{tc("actions.import")}</span>
          </Button>
        )}
        {settings}
      </div>
    </div>
  );
}

/** Dải tag bộ lọc đang áp dụng (từ "Bộ lọc" chung hoặc icon phễu trên header cột) */
export function FilterTags<T>({ list, columns }: { list: ListState; columns: ListColumn<T>[] }) {
  const t = useTranslations("list");
  const tc = useTranslations("common");
  const tags = columns
    .filter((c) => c.filter)
    .map((c) => ({ col: c, text: filterTagText(c, list.filters, t, tc) }))
    .filter((t): t is { col: ListColumn<T>; text: string } => Boolean(t.text));
  if (!tags.length && !list.search) return null;
  return (
    <div className="filter-tags">
      {list.search && (
        <span className="filter-tag">
          {t("filter.keyword", { value: list.search })}
          <button type="button" aria-label={t("filter.removeKeyword")} onClick={() => list.setSearch("")}>
            <X className="size-3" />
          </button>
        </span>
      )}
      {tags.map(({ col, text }) => (
        <span key={col.key} className="filter-tag">
          {text}
          <button type="button" aria-label={t("filter.removeFilter", { column: col.title })} onClick={() => list.setFilters(clearFilterPatch(col))}>
            <X className="size-3" />
          </button>
        </span>
      ))}
      <Button variant="link" size="xs" className="h-auto p-0" onClick={list.clearFilters}>
        {tc("actions.clear")}
      </Button>
    </div>
  );
}
