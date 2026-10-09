"use client";

import { useMemo, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { Paginated } from "@/lib/api/types";
import type { ComboOption } from "./Combobox";

export interface EntityFetchParams {
  search: string;
  page: number;
  page_size: number;
}

export interface EntityOptionsSource<TItem> {
  queryKey: readonly unknown[];
  fetchPage: (params: EntityFetchParams) => Promise<Paginated<TItem>>;
  toOption: (item: TItem) => ComboOption;
  /** Lựa chọn đã có sẵn (vd. giá trị đang chọn khi sửa) — hiện nhãn ngay, không chờ tải */
  initialOptions?: ComboOption[];
  pageSize?: number;
}

const NO_OPTIONS: ComboOption[] = [];

/**
 * Nguồn lựa chọn từ API danh sách cho `Combobox`: tìm ở server (debounce 300ms), cuộn vô hạn theo trang,
 * chỉ gọi API khi ô chọn mở, cache 60 giây theo từ khóa. Truyền thẳng kết quả vào Combobox:
 * `<Combobox {...useEntityOptions(source)} value onChange />`.
 */
export function useEntityOptions<TItem>({ queryKey, fetchPage, toOption, initialOptions = NO_OPTIONS, pageSize = 20 }: EntityOptionsSource<TItem>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const query = useInfiniteQuery({
    queryKey: [...queryKey, "options", search],
    queryFn: ({ pageParam }) => fetchPage({ search, page: pageParam, page_size: pageSize }),
    initialPageParam: 1,
    getNextPageParam: (last, pages) => (last.next ? pages.length + 1 : undefined),
    enabled: open,
    staleTime: 60_000,
  });
  const options = useMemo(() => {
    const loaded = (query.data?.pages ?? []).flatMap((p) => p.results.map(toOption));
    const seen = new Set(loaded.map((o) => o.value));
    return [...loaded, ...initialOptions.filter((o) => !seen.has(o.value))];
  }, [query.data, toOption, initialOptions]);
  return {
    options,
    loading: query.isFetching,
    hasMore: Boolean(query.hasNextPage),
    onOpenChange: setOpen,
    onSearch: (text: string) => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setSearch(text.trim()), 300);
    },
    onReachEnd: () => {
      if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage();
    },
  };
}
