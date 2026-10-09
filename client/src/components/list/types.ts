import type React from "react";
import type { EntityOptionsSource } from "@/components/controls/useEntityOptions";

export interface FilterOption {
  label: string;
  value: string | number | boolean;
  /** Hiển thị thêm trong ô chọn Combobox của bộ lọc */
  code?: string | null;
  image?: string | null;
  /** Biểu tượng trước nhãn (vd. cờ quốc gia) */
  icon?: React.ReactNode;
  description?: React.ReactNode;
}

export interface FilterTreeNode {
  title: string;
  value: string | number;
  children?: FilterTreeNode[];
}

/**
 * Bộ lọc theo kiểu cột. `param` = tên tham số API (mặc định suy ra từ `filterField` / `key`):
 * text `<f>__icontains` · select / boolean `<f>` · multiSelect / tree / remote `<f>__in`
 * · number `<f>__gte` + `<f>__lte` · date `<f>__date__gte` + `<f>__date__lte`.
 * Backend khai báo lookup tương ứng trong `filterset_fields` (dạng dict).
 */
export type ColumnFilter =
  | { type: "text"; param?: string; placeholder?: string }
  | { type: "select"; param?: string; options: FilterOption[] }
  | { type: "boolean"; param?: string; labels?: [string, string] }
  | { type: "multiSelect"; param?: string; options: FilterOption[] }
  | { type: "tree"; param?: string; treeData: FilterTreeNode[] }
  | { type: "number"; param?: string; params?: [string, string] }
  | { type: "date"; param?: string; /** Tên 2 tham số từ / đến khi API không theo quy ước (vd. ["date_from", "date_to"]) */ params?: [string, string] }
  /** Remote: `source` (API danh sách phân trang → cuộn vô hạn, khuyến nghị) hoặc `fetchOptions` (danh mục nhỏ trả hết một lần) */
  | { type: "remote"; param?: string; source?: EntityOptionsSource<unknown>; fetchOptions?: (search: string) => Promise<FilterOption[]> };

export interface ListColumn<T> {
  /** Định danh cột (lưu cấu hình, sắp xếp / lọc mặc định theo trường này) */
  key: string;
  title: string;
  /** Mặc định = key */
  dataIndex?: string | string[];
  render?: (value: any, record: T, index: number) => React.ReactNode; // eslint-disable-line @typescript-eslint/no-explicit-any
  width?: number;
  minWidth?: number;
  align?: "left" | "center" | "right";
  pinned?: "left" | "right";
  /** true = sắp xếp theo `key`; chuỗi = tên trường `ordering` ở API */
  sortable?: boolean | string;
  filter?: ColumnFilter;
  /** Trường gốc để suy ra tham số lọc (mặc định = key) */
  filterField?: string;
  /** Ẩn mặc định, bật lại trong ⚙ */
  defaultHidden?: boolean;
  /** false = không cho ẩn (cột định danh) */
  hideable?: boolean;
  /** Biến ô thành link (vd. tới trang chi tiết) */
  link?: (record: T) => string | undefined;
  ellipsis?: boolean;
}

export function defineColumns<T>(columns: ListColumn<T>[]): ListColumn<T>[] {
  return columns;
}

/** Khai báo nguồn phân trang cho bộ lọc `remote` (giữ kiểu phần tử khi viết `toOption`) */
export function remoteSource<TItem>(source: EntityOptionsSource<TItem>): EntityOptionsSource<unknown> {
  return source as EntityOptionsSource<unknown>;
}
