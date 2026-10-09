"use client";

import React, { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ColumnHeader } from "./ColumnHeader";
import { measureColumnWidth, type ResolvedColumns } from "./columnLayout";
import { Pagination } from "./Pagination";
import type { ListState } from "./useListState";
import type { ListPreferencesApi } from "./useListPreferences";
import type { ListColumn } from "./types";

const SKELETON_ROWS = 8;
const MIN_WIDTH = 64;
const DEFAULT_WIDTH = 160;
const SELECT_WIDTH = 44;

export interface ListTableProps<T> {
  resolved: ResolvedColumns<T>;
  prefsApi: ListPreferencesApi;
  list: ListState;
  data: T[] | undefined;
  total: number;
  loading: boolean;
  fetching: boolean;
  rowKey: string;
  selection?: {
    selectedKeys: React.Key[];
    onChange: (keys: React.Key[]) => void;
    isDisabled?: (record: T) => boolean;
  };
  /** Cột thao tác ghim phải (Sửa · Xóa · ⋯) */
  actions?: { width: number; render: (record: T) => React.ReactNode };
  empty: React.ReactNode;
}

function isEmptyValue(v: unknown) {
  return v === null || v === undefined || v === "";
}

function getValue<T>(record: T, col: ListColumn<T>): unknown {
  const path = col.dataIndex ?? col.key;
  const keys = Array.isArray(path) ? path : [path];
  return keys.reduce<unknown>((acc, k) => (acc == null ? acc : (acc as Record<string, unknown>)[k]), record);
}

/**
 * Bảng danh sách tự dựng (không phụ thuộc thư viện bảng): phân trang / sắp xếp / lọc ở server,
 * cột ghim bằng position: sticky, co giãn & tự vừa độ rộng, chọn dòng, Skeleton lần đầu.
 */
export function ListTable<T extends object>({ resolved, prefsApi, list, data, total, loading, fetching, rowKey, selection, actions, empty }: ListTableProps<T>) {
  const t = useTranslations("list");
  const tc = useTranslations("common");
  const { prefs, update } = prefsApi;
  const [liveWidths, setLiveWidths] = useState<Record<string, number>>({});
  const wrapRef = useRef<HTMLDivElement>(null);
  const showSkeleton = loading && !data;
  const rows = data ?? [];
  const visible = resolved.visible;

  const widthOf = (col: ListColumn<T>) => liveWidths[col.key] ?? prefs.widths[col.key] ?? col.width ?? DEFAULT_WIDTH;
  const setWidth = (key: string, width: number) => {
    update((p) => ({ widths: { ...p.widths, [key]: width } }));
    setLiveWidths((w) => {
      const next = { ...w };
      delete next[key];
      return next;
    });
  };
  const fit = (key: string) => {
    const w = measureColumnWidth(wrapRef.current, key);
    if (w) setWidth(key, w);
  };

  // Vị trí dính của cột ghim (tính từ độ rộng khai báo — cột đệm giữ cho độ rộng không bị giãn)
  const left = visible.filter((c) => resolved.pinOf(c) === "left");
  const middle = visible.filter((c) => !resolved.pinOf(c));
  const right = visible.filter((c) => resolved.pinOf(c) === "right");
  const offsets = new Map<string, { side: "left" | "right"; px: number; edge: boolean }>();
  let acc = selection ? SELECT_WIDTH : 0;
  left.forEach((c, i) => {
    offsets.set(c.key, { side: "left", px: acc, edge: i === left.length - 1 });
    acc += widthOf(c);
  });
  acc = actions ? actions.width : 0;
  [...right].reverse().forEach((c, i) => {
    offsets.set(c.key, { side: "right", px: acc, edge: i === right.length - 1 });
    acc += widthOf(c);
  });
  const ordered = [...left, ...middle, ...right];
  const fillerAfter = left.length + middle.length - 1; // chỉ số cột mà cột đệm đứng sau (-1: trước cột đầu)
  const totalWidth = ordered.reduce((s, c) => s + widthOf(c), 0) + (selection ? SELECT_WIDTH : 0) + (actions ? actions.width : 0);
  const colCount = ordered.length + 1 + (selection ? 1 : 0) + (actions ? 1 : 0);

  const stickyStyle = (key: string, z: number): React.CSSProperties | undefined => {
    const o = offsets.get(key);
    return o ? { position: "sticky", [o.side]: o.px, zIndex: z } : undefined;
  };
  const stickyClass = (key: string) => {
    const o = offsets.get(key);
    return o ? cn("dt-sticky", o.edge && (o.side === "left" ? "dt-edge-left" : "dt-edge-right")) : undefined;
  };

  // Chọn dòng (trang hiện tại)
  const idOf = (r: T) => (r as Record<string, unknown>)[rowKey] as React.Key;
  const selectable = rows.filter((r) => !selection?.isDisabled?.(r));
  const selectedSet = new Set(selection?.selectedKeys ?? []);
  const allChecked = selectable.length > 0 && selectable.every((r) => selectedSet.has(idOf(r)));
  const someChecked = selectable.some((r) => selectedSet.has(idOf(r)));

  const startResize = (e: React.MouseEvent, col: ListColumn<T>) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startWidth = widthOf(col);
    let last = startWidth;
    const move = (ev: MouseEvent) => {
      last = Math.max(MIN_WIDTH, Math.round(startWidth + ev.clientX - startX));
      setLiveWidths((prev) => ({ ...prev, [col.key]: last }));
    };
    const up = () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
      document.body.classList.remove("is-resizing-column");
      setWidth(col.key, last);
    };
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
    document.body.classList.add("is-resizing-column");
  };

  const renderCell = (col: ListColumn<T>, record: T, index: number) => {
    const value = getValue(record, col);
    const raw = col.render ? col.render(value, record, index) : value;
    const content = isEmptyValue(raw) ? <span className="list-empty-value">—</span> : typeof raw === "object" ? (raw as React.ReactNode) : String(raw);
    const href = col.link?.(record);
    return href ? (
      <Link href={href} className="list-link" onClick={(e) => e.stopPropagation()}>
        {content}
      </Link>
    ) : (
      content
    );
  };

  const filler = (key: string, head: boolean) => (head ? <th key={key} className="dt-th dt-filler" aria-hidden /> : <td key={key} className="dt-td dt-filler" aria-hidden />);

  return (
    <div className="list-table-wrap">
      {fetching && !showSkeleton && <div className="list-progress" aria-hidden />}
      <div ref={wrapRef} className="dt-scroll">
        <table className="dt" data-density={prefs.density} style={{ width: `max(100%, ${totalWidth}px)` }}>
          <colgroup>
            {selection && <col style={{ width: SELECT_WIDTH }} />}
            {ordered.map((c, i) => (
              <React.Fragment key={c.key}>
                {i === 0 && fillerAfter === -1 && <col />}
                <col style={{ width: widthOf(c) }} />
                {i === fillerAfter && <col />}
              </React.Fragment>
            ))}
            {ordered.length === 0 && <col />}
            {actions && <col style={{ width: actions.width }} />}
          </colgroup>
          <thead>
            <tr>
              {selection && (
                <th className="dt-th dt-sticky dt-select" style={{ position: "sticky", left: 0, zIndex: 3 }}>
                  <Checkbox
                    aria-label={t("table.selectPage")}
                    disabled={showSkeleton || selectable.length === 0}
                    checked={allChecked ? true : someChecked ? "indeterminate" : false}
                    onCheckedChange={(c) => {
                      const pageKeys = selectable.map(idOf);
                      const others = selection.selectedKeys.filter((k) => !pageKeys.includes(k));
                      selection.onChange(c === true ? [...others, ...pageKeys] : others);
                    }}
                  />
                </th>
              )}
              {ordered.map((col, index) => {
                const sortField = col.sortable ? (typeof col.sortable === "string" ? col.sortable : col.key) : null;
                return (
                  <React.Fragment key={col.key}>
                    {index === 0 && fillerAfter === -1 && filler("filler-h", true)}
                    <th data-col={col.key} className={cn("dt-th", stickyClass(col.key))} style={{ ...stickyStyle(col.key, 3), textAlign: col.align }}>
                      <ColumnHeader
                        column={col}
                        sortField={sortField}
                        ordering={list.ordering}
                        onSort={list.setOrdering}
                        filters={list.filters}
                        onFilter={list.setFilters}
                        pin={resolved.pinOf(col)}
                        onPin={(side) => update((p) => ({ pinned: { ...p.pinned, [col.key]: side } }))}
                      />
                      <span
                        className="list-resize-handle"
                        role="separator"
                        aria-orientation="vertical"
                        onMouseDown={(e) => startResize(e, col)}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          fit(col.key);
                        }}
                      />
                    </th>
                    {index === fillerAfter && filler("filler-h", true)}
                  </React.Fragment>
                );
              })}
              {ordered.length === 0 && filler("filler-h", true)}
              {actions && <th className="dt-th dt-sticky dt-actions" style={{ position: "sticky", right: 0, zIndex: 3 }} aria-label={tc("fields.actions")} />}
            </tr>
          </thead>
          <tbody>
            {showSkeleton ? (
              Array.from({ length: SKELETON_ROWS }, (_, r) => (
                <tr key={`sk-${r}`} className="dt-row">
                  {Array.from({ length: colCount }, (_, c) => (
                    <td key={c} className="dt-td">
                      <Skeleton className="h-4 w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={colCount} className="dt-empty">
                  {empty}
                </td>
              </tr>
            ) : (
              rows.map((record, rowIndex) => {
                const id = idOf(record);
                const checked = selectedSet.has(id);
                return (
                  <tr key={String(id)} className="dt-row" data-state={checked ? "selected" : undefined}>
                    {selection && (
                      <td className="dt-td dt-sticky dt-select" style={{ position: "sticky", left: 0, zIndex: 1 }}>
                        <Checkbox
                          aria-label={t("table.selectRow")}
                          checked={checked}
                          disabled={selection.isDisabled?.(record) ?? false}
                          onCheckedChange={(c) => selection.onChange(c === true ? [...selection.selectedKeys, id] : selection.selectedKeys.filter((k) => k !== id))}
                        />
                      </td>
                    )}
                    {ordered.map((col, index) => (
                      <React.Fragment key={col.key}>
                        {index === 0 && fillerAfter === -1 && filler("filler", false)}
                        <td data-col={col.key} className={cn("dt-td", col.ellipsis && "dt-ellipsis", stickyClass(col.key))} style={{ ...stickyStyle(col.key, 1), textAlign: col.align }}>
                          {renderCell(col, record, rowIndex)}
                        </td>
                        {index === fillerAfter && filler("filler", false)}
                      </React.Fragment>
                    ))}
                    {ordered.length === 0 && filler("filler", false)}
                    {actions && (
                      <td className="dt-td dt-sticky dt-actions" style={{ position: "sticky", right: 0, zIndex: 1 }}>
                        {actions.render(record)}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {!showSkeleton && total > 0 && <Pagination page={list.page} pageSize={list.pageSize} total={total} onChange={list.setPage} />}
    </div>
  );
}
