"use client";

import React, { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, ChevronRight, ChevronsUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { normalizeText } from "@/lib/text/normalize";
import { cn } from "@/lib/utils";

export interface TreeNode {
  value: string;
  label: string;
  disabled?: boolean;
  children?: TreeNode[];
}

function flatten(nodes: TreeNode[], acc: TreeNode[] = []): TreeNode[] {
  for (const n of nodes) {
    acc.push(n);
    if (n.children) flatten(n.children, acc);
  }
  return acc;
}

function descendants(node: TreeNode): string[] {
  return flatten(node.children ?? []).map((n) => n.value);
}

/** Lọc cây theo từ khóa: giữ nút khớp và tổ tiên của nó */
function filterTree(nodes: TreeNode[], q: string): TreeNode[] {
  if (!q) return nodes;
  const out: TreeNode[] = [];
  for (const n of nodes) {
    const children = filterTree(n.children ?? [], q);
    if (normalizeText(n.label).includes(q) || children.length) out.push({ ...n, children });
  }
  return out;
}

interface TreeListProps {
  nodes: TreeNode[];
  /** Chế độ checkbox (chọn nhiều, chọn cha = chọn cả con) */
  checkable?: boolean;
  selected: string[];
  onToggle: (node: TreeNode) => void;
  expandAll?: boolean;
}

function TreeList({ nodes, checkable, selected, onToggle, expandAll }: TreeListProps) {
  const t = useTranslations("form");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const render = (list: TreeNode[], depth: number): React.ReactNode =>
    list.map((n) => {
      const hasChildren = Boolean(n.children?.length);
      const open = expandAll || !collapsed.has(n.value);
      const isSel = selected.includes(n.value);
      return (
        <React.Fragment key={n.value}>
          <div
            className={cn("flex items-center gap-1 rounded-sm py-1.5 pr-2 text-sm hover:bg-accent", n.disabled && "pointer-events-none opacity-50")}
            style={{ paddingLeft: 4 + depth * 16 }}
          >
            <button
              type="button"
              className={cn("flex size-5 items-center justify-center rounded-sm text-muted-foreground", !hasChildren && "invisible")}
              onClick={() =>
                setCollapsed((prev) => {
                  const next = new Set(prev);
                  if (next.has(n.value)) next.delete(n.value);
                  else next.add(n.value);
                  return next;
                })
              }
              aria-label={open ? t("collapse") : t("expand")}
            >
              <ChevronRight className={cn("size-3.5 transition-transform", open && "rotate-90")} />
            </button>
            <button type="button" className="flex flex-1 items-center gap-2 text-left" onClick={() => onToggle(n)}>
              {checkable ? <Checkbox checked={isSel} className="pointer-events-none" /> : <Check className={cn("size-4", isSel ? "opacity-100" : "opacity-0")} />}
              <span className="truncate">{n.label}</span>
            </button>
          </div>
          {hasChildren && open && render(n.children!, depth + 1)}
        </React.Fragment>
      );
    });
  return <>{render(nodes, 0)}</>;
}

interface TreeSelectProps {
  tree: TreeNode[];
  value: string | null | undefined;
  onChange: (value: string | null) => void;
  placeholder?: string;
  allowClear?: boolean;
  disabled?: boolean;
  "aria-invalid"?: boolean;
  id?: string;
}

/** Chọn 1 nút trong cây (vd. nhóm cha của nhóm vật tư) */
export function TreeSelect({ tree, value, onChange, placeholder, allowClear, disabled, id, ...rest }: TreeSelectProps) {
  const t = useTranslations("form");
  const tc = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const all = useMemo(() => flatten(tree), [tree]);
  const label = all.find((n) => n.value === value)?.label;
  const shown = useMemo(() => filterTree(tree, normalizeText(query)), [tree, query]);

  return (
    <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) setQuery(""); }}>
      <PopoverTrigger asChild>
        <Button id={id} type="button" variant="outline" disabled={disabled} aria-invalid={rest["aria-invalid"]} className={cn("w-full justify-between font-normal aria-invalid:border-destructive", !label && "text-muted-foreground")}>
          <span className="truncate">{label ?? placeholder ?? t("selectPlaceholder")}</span>
          <span className="flex items-center gap-1">
            {allowClear && value && !disabled && (
              <X className="size-3.5 opacity-60 hover:opacity-100" onClick={(e) => { e.stopPropagation(); onChange(null); }} />
            )}
            <ChevronsUpDown className="size-4 opacity-50" />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) min-w-64 p-2" align="start">
        <Input placeholder={t("searchPlaceholder")} value={query} onChange={(e) => setQuery(e.target.value)} className="mb-2 h-8" />
        <div className="max-h-72 overflow-y-auto">
          {shown.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">{tc("status.noData")}</p>
          ) : (
            <TreeList
              nodes={shown}
              selected={value ? [value] : []}
              expandAll={Boolean(query)}
              onToggle={(n) => {
                onChange(n.value === value && allowClear ? null : n.value);
                setOpen(false);
              }}
            />
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** Cây checkbox (lọc theo nhiều nhóm): chọn cha = chọn cả con */
export function TreeChecklist({ tree, value, onChange }: { tree: TreeNode[]; value: string[]; onChange: (value: string[]) => void }) {
  const t = useTranslations("form");
  const [query, setQuery] = useState("");
  const shown = useMemo(() => filterTree(tree, normalizeText(query)), [tree, query]);
  const toggle = (node: TreeNode) => {
    const group = [node.value, ...descendants(node)];
    const next = new Set(value);
    if (next.has(node.value)) group.forEach((v) => next.delete(v));
    else group.forEach((v) => next.add(v));
    onChange([...next]);
  };
  return (
    <div>
      <Input placeholder={t("searchPlaceholder")} value={query} onChange={(e) => setQuery(e.target.value)} className="mb-2 h-8" />
      <div className="max-h-60 overflow-y-auto">
        <TreeList nodes={shown} checkable selected={value} onToggle={toggle} expandAll />
      </div>
    </div>
  );
}
