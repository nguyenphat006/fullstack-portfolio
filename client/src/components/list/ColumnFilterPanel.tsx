"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Combobox, type ComboOption } from "@/components/controls/Combobox";
import { useEntityOptions, type EntityOptionsSource } from "@/components/controls/useEntityOptions";
import { DateRangePicker } from "@/components/controls/DateRangePicker";
import { TreeChecklist, type TreeNode } from "@/components/controls/TreeSelect";
import { readFilter, writeFilter, type FilterValue } from "./filters";
import type { FilterOption, FilterTreeNode, ListColumn } from "./types";

interface ColumnFilterPanelProps<T> {
  column: ListColumn<T>;
  filters: Record<string, string>;
  onApply: (patch: Record<string, string | null>) => void;
}

const toTree = (nodes: FilterTreeNode[]): TreeNode[] => nodes.map((n) => ({ value: String(n.value), label: n.title, children: n.children ? toTree(n.children) : undefined }));
const toCombo = (options: FilterOption[]): ComboOption[] =>
  options.map((o) => ({ value: String(o.value), label: o.label, code: o.code, image: o.image, icon: o.icon, description: o.description }));

/**
 * Ô nhập giá trị lọc theo kiểu cột (không có nút). Dùng chung cho popover lọc cột và panel "Bộ lọc".
 * Lọc chọn 1 / nhiều (`select`, `boolean`, `multiSelect`, `remote`) dùng `Combobox`:
 * `variant="inline"` (popover cột) hiện sẵn danh sách; `"dropdown"` (panel chung) thu gọn trong ô chọn.
 */
export function FilterField<T>({
  column,
  value,
  onChange,
  onEnter,
  autoFocus,
  variant = "dropdown",
}: {
  column: ListColumn<T>;
  value: FilterValue;
  onChange: (v: FilterValue) => void;
  onEnter?: () => void;
  autoFocus?: boolean;
  variant?: "inline" | "dropdown";
}) {
  const t = useTranslations("list");
  const tc = useTranslations("common");
  const f = column.filter;
  const inline = variant === "inline";
  if (!f) return null;

  switch (f.type) {
    case "text":
      return (
        <Input
          autoFocus={autoFocus}
          className="h-8"
          placeholder={f.placeholder ?? t("filter.containsPlaceholder", { column: column.title })}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
          onKeyDown={(e) => e.key === "Enter" && onEnter?.()}
        />
      );
    case "select":
    case "boolean": {
      const options: ComboOption[] =
        f.type === "boolean"
          ? [
              { label: f.labels?.[0] ?? tc("status.yes"), value: "true" },
              { label: f.labels?.[1] ?? tc("status.no"), value: "false" },
            ]
          : toCombo(f.options);
      return (
        <Combobox
          inline={inline}
          allowClear
          options={options}
          value={(value as string) ?? null}
          onChange={(v) => onChange(v)}
          placeholder={inline ? t("filter.search") : t("filter.searchAndSelect")}
        />
      );
    }
    case "multiSelect":
      return (
        <Combobox
          multiple
          inline={inline}
          allowClear
          options={toCombo(f.options)}
          value={(value as string[] | null) ?? []}
          onChange={(v) => onChange(v.length ? v : null)}
          placeholder={inline ? t("filter.search") : t("filter.searchAndSelect")}
        />
      );
    case "tree":
      return <TreeChecklist tree={toTree(f.treeData)} value={(value as string[] | null) ?? []} onChange={(v) => onChange(v.length ? v : null)} />;
    case "number": {
      const [from, to] = (value as [string | null, string | null] | null) ?? [null, null];
      return (
        <div className="flex gap-2">
          <Input className="h-8" type="number" placeholder={t("filter.from")} value={from ?? ""} onChange={(e) => onChange([e.target.value || null, to])} />
          <Input className="h-8" type="number" placeholder={t("filter.to")} value={to ?? ""} onChange={(e) => onChange([from, e.target.value || null])} />
        </div>
      );
    }
    case "date":
      return <DateRangePicker value={(value as [string | null, string | null] | null) ?? null} onChange={(v) => onChange(v)} />;
    case "remote": {
      const v = (value as string[] | null) ?? [];
      const set = (next: string[]) => onChange(next.length ? next : null);
      if (f.source) return <RemotePagedFilter source={f.source} value={v} onChange={set} inline={inline} />;
      return f.fetchOptions ? <RemoteFilter fetchOptions={f.fetchOptions} value={v} onChange={set} inline={inline} /> : null;
    }
  }
}

/** Ô lọc một cột + Đặt lại / Lọc (popover lọc trên header cột — lựa chọn hiện sẵn, không thả xuống). */
export function ColumnFilterPanel<T>({ column, filters, onApply }: ColumnFilterPanelProps<T>) {
  const t = useTranslations("list");
  const tc = useTranslations("common");
  const current = useMemo(() => readFilter(column, filters), [column, filters]);
  const [draft, setDraft] = useState<FilterValue>(current);

  useEffect(() => setDraft(current), [current]); // eslint-disable-line react-hooks/set-state-in-effect

  if (!column.filter) return null;
  const apply = () => onApply(writeFilter(column, draft));
  const reset = () => {
    setDraft(null);
    onApply(writeFilter(column, null));
  };

  return (
    <div className="list-filter">
      <FilterField column={column} value={draft} onChange={setDraft} onEnter={apply} autoFocus variant="inline" />
      <div className="list-filter__footer">
        <Button size="sm" variant="ghost" onClick={reset} disabled={current === null && draft === null}>
          {tc("actions.reset")}
        </Button>
        <Button size="sm" onClick={apply}>
          {t("filter.apply")}
        </Button>
      </div>
    </div>
  );
}

/** Bộ lọc remote theo API phân trang: tìm ở server + cuộn vô hạn (hook chung useEntityOptions) */
function RemotePagedFilter({ source, value, onChange, inline }: { source: EntityOptionsSource<unknown>; value: string[]; onChange: (v: string[]) => void; inline: boolean }) {
  const t = useTranslations("list");
  const opts = useEntityOptions(source);
  return <Combobox multiple inline={inline} allowClear value={value} onChange={onChange} placeholder={inline ? t("filter.search") : t("filter.searchAndSelect")} {...opts} />;
}

function RemoteFilter({ fetchOptions, value, onChange, inline }: { fetchOptions: (search: string) => Promise<FilterOption[]>; value: string[]; onChange: (v: string[]) => void; inline: boolean }) {
  const t = useTranslations("list");
  const [options, setOptions] = useState<ComboOption[]>([]);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const load = (search: string) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetchOptions(search);
        setOptions((prev) => {
          // giữ nhãn của mục đã chọn khi đổi từ khóa
          const keep = prev.filter((o) => value.includes(o.value));
          const next = toCombo(res);
          const seen = new Set(next.map((o) => o.value));
          return [...next, ...keep.filter((o) => !seen.has(o.value))];
        });
      } finally {
        setLoading(false);
      }
    }, 300);
  };
  return (
    <Combobox
      multiple
      inline={inline}
      allowClear
      options={options}
      value={value}
      onChange={onChange}
      onSearch={load}
      loading={loading}
      onOpenChange={(open) => open && options.length === 0 && load("")}
      placeholder={inline ? t("filter.search") : t("filter.searchAndSelect")}
    />
  );
}
