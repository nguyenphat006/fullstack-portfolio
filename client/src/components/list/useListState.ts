"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/** Tham số dành riêng; mọi tham số khác trên URL là bộ lọc, gửi thẳng lên API. */
const RESERVED = new Set(["q", "page", "page_size", "ordering"]);

export interface ListStateOptions {
  defaultPageSize?: number;
  /** Sắp xếp mặc định khi URL không có `ordering` (không ghi lên URL) */
  defaultOrdering?: string;
}

export type ListParamsValue = string | number;

export interface ListState {
  search: string;
  page: number;
  pageSize: number;
  /** "field" tăng dần, "-field" giảm dần, null = mặc định của API */
  ordering: string | null;
  /** Bộ lọc thô theo tên tham số API, vd. { is_active: "true", category__in: "3,5" } */
  filters: Record<string, string>;
  /** Tham số gửi API: search, page, page_size, ordering + bộ lọc */
  params: Record<string, ListParamsValue>;
  hasFilters: boolean;
  setSearch: (value: string) => void;
  setPage: (page: number, pageSize?: number) => void;
  setOrdering: (value: string | null) => void;
  /** Gộp thay đổi bộ lọc; giá trị rỗng / null => xóa tham số. Luôn về trang 1. */
  setFilters: (patch: Record<string, string | null | undefined>) => void;
  clearFilters: () => void;
}

/**
 * Trạng thái trang danh sách lưu trên URL (tìm kiếm, bộ lọc, trang, sắp xếp)
 * -> F5, quay lại từ trang chi tiết, gửi link đều giữ nguyên danh sách đang xem.
 */
export function useListState({ defaultPageSize = 20, defaultOrdering }: ListStateOptions = {}): ListState {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  const state = useMemo(() => {
    const sp = new URLSearchParams(query);
    const filters: Record<string, string> = {};
    sp.forEach((value, key) => {
      if (!RESERVED.has(key) && value !== "") filters[key] = value;
    });
    const page = Math.max(1, Number(sp.get("page")) || 1);
    const pageSize = Number(sp.get("page_size")) || defaultPageSize;
    const ordering = sp.get("ordering") || null;
    const search = sp.get("q") || "";
    const params: Record<string, ListParamsValue> = { ...filters, page, page_size: pageSize };
    if (search) params.search = search;
    if (ordering || defaultOrdering) params.ordering = (ordering || defaultOrdering) as string;
    return { filters, page, pageSize, ordering, search, params };
  }, [query, defaultPageSize, defaultOrdering]);

  const update = useCallback(
    (patch: Record<string, string | number | null | undefined>, resetPage = true) => {
      const sp = new URLSearchParams(query);
      for (const [key, value] of Object.entries(patch)) {
        if (value === null || value === undefined || value === "") sp.delete(key);
        else sp.set(key, String(value));
      }
      if (resetPage && !("page" in patch)) sp.delete("page");
      if (sp.get("page") === "1") sp.delete("page");
      if (sp.get("page_size") === String(defaultPageSize)) sp.delete("page_size");
      const next = sp.toString();
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    },
    [query, pathname, router, defaultPageSize],
  );

  return {
    ...state,
    hasFilters: Object.keys(state.filters).length > 0 || Boolean(state.search),
    setSearch: (value) => update({ q: value.trim() || null }),
    setPage: (page, pageSize) =>
      update({ page, ...(pageSize && pageSize !== state.pageSize ? { page_size: pageSize, page: 1 } : {}) }, false),
    setOrdering: (value) => update({ ordering: value }),
    setFilters: (patch) => update(patch),
    clearFilters: () => {
      const cleared: Record<string, null> = { q: null };
      for (const key of Object.keys(state.filters)) cleared[key] = null;
      update(cleared);
    },
  };
}
