import type { ColumnFilter, FilterOption, FilterTreeNode, ListColumn } from "./types";
import type { useTranslations } from "next-intl";

type Patch = Record<string, string | null>;

/** Giá trị bộ lọc đã giải mã theo kiểu */
export type FilterValue = string | string[] | [string | null, string | null] | null;

function field<T>(col: ListColumn<T>) {
  return col.filterField ?? col.key;
}

/** Tên các tham số API mà bộ lọc của cột sử dụng */
export function filterParamKeys<T>(col: ListColumn<T>): string[] {
  const f = col.filter;
  if (!f) return [];
  const base = f.param ?? field(col);
  switch (f.type) {
    case "text":
      return [f.param ?? `${field(col)}__icontains`];
    case "select":
    case "boolean":
      return [base];
    case "multiSelect":
    case "tree":
    case "remote":
      return [f.param ?? `${field(col)}__in`];
    case "number":
      return f.params ?? [`${base}__gte`, `${base}__lte`];
    case "date":
      return f.params ?? [`${base}__date__gte`, `${base}__date__lte`];
  }
}

export function readFilter<T>(col: ListColumn<T>, filters: Record<string, string>): FilterValue {
  const f = col.filter;
  if (!f) return null;
  const keys = filterParamKeys(col);
  if (f.type === "number" || f.type === "date") {
    const from = filters[keys[0]] ?? null;
    const to = filters[keys[1]] ?? null;
    return from || to ? [from, to] : null;
  }
  const raw = filters[keys[0]];
  if (!raw) return null;
  if (f.type === "multiSelect" || f.type === "tree" || f.type === "remote") return raw.split(",").filter(Boolean);
  return raw;
}

export function writeFilter<T>(col: ListColumn<T>, value: FilterValue): Patch {
  const keys = filterParamKeys(col);
  const f = col.filter;
  if (!f) return {};
  if (f.type === "number" || f.type === "date") {
    const [from, to] = (Array.isArray(value) ? value : [null, null]) as [string | null, string | null];
    return { [keys[0]]: from || null, [keys[1]]: to || null };
  }
  if (Array.isArray(value)) return { [keys[0]]: value.length ? value.join(",") : null };
  return { [keys[0]]: value || null };
}

export function isFilterActive<T>(col: ListColumn<T>, filters: Record<string, string>) {
  return filterParamKeys(col).some((k) => Boolean(filters[k]));
}

function flattenTree(nodes: FilterTreeNode[], acc: FilterOption[] = []): FilterOption[] {
  for (const n of nodes) {
    acc.push({ label: n.title, value: n.value });
    if (n.children) flattenTree(n.children, acc);
  }
  return acc;
}

function optionsOf(f: ColumnFilter, tc: CommonT): FilterOption[] {
  if (f.type === "select" || f.type === "multiSelect") return f.options;
  if (f.type === "tree") return flattenTree(f.treeData);
  if (f.type === "boolean") return [
    { label: f.labels?.[0] ?? tc("status.yes"), value: "true" },
    { label: f.labels?.[1] ?? tc("status.no"), value: "false" },
  ];
  return [];
}

export function formatDateParam(value: string) {
  const [y, m, d] = value.split("-");
  return y && m && d ? `${d}/${m}/${y}` : value;
}

type ListT = ReturnType<typeof useTranslations<"list">>;
type CommonT = ReturnType<typeof useTranslations<"common">>;

/** Nhãn hiển thị trên tag bộ lọc, vd. "Trạng thái: Hoạt động" (t / tc: useTranslations của component gọi) */
export function filterTagText<T>(col: ListColumn<T>, filters: Record<string, string>, t: ListT, tc: CommonT): string | null {
  const f = col.filter;
  const value = readFilter(col, filters);
  if (!f || value === null) return null;
  const labelOf = (v: string) => String(optionsOf(f, tc).find((o) => String(o.value) === v)?.label ?? v);
  let text: string;
  switch (f.type) {
    case "text":
      text = t("filter.contains", { value: String(value) });
      break;
    case "select":
    case "boolean":
      text = labelOf(value as string);
      break;
    case "multiSelect":
    case "tree": {
      const labels = (value as string[]).map(labelOf);
      text = labels.length > 2 ? `${labels.slice(0, 2).join(", ")} +${labels.length - 2}` : labels.join(", ");
      break;
    }
    case "remote":
      text = t("filter.itemsCount", { count: (value as string[]).length });
      break;
    case "number":
    case "date": {
      const fmt = f.type === "date" ? formatDateParam : (v: string) => v;
      const [from, to] = value as [string | null, string | null];
      text = from && to ? `${fmt(from)} – ${fmt(to)}` : from ? t("filter.fromValue", { value: fmt(from) }) : t("filter.toValue", { value: fmt(to as string) });
      break;
    }
  }
  return `${col.title}: ${text}`;
}

export function clearFilterPatch<T>(col: ListColumn<T>): Patch {
  return Object.fromEntries(filterParamKeys(col).map((k) => [k, null]));
}
