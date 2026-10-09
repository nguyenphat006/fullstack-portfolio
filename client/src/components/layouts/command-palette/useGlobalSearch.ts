"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SEARCH_MIN_LENGTH, searchService, type SearchGroup } from "@/services/search.service";

const DEBOUNCE_MS = 250;
const NO_GROUPS: SearchGroup[] = [];

/** Tìm bản ghi trên server (debounce 250ms, từ khóa ≥ 2 ký tự, cache 30 giây theo từ khóa) */
export function useGlobalSearch(query: string, enabled: boolean) {
  const [debounced, setDebounced] = useState(query.trim());
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const active = enabled && debounced.length >= SEARCH_MIN_LENGTH;
  const result = useQuery({
    queryKey: ["global-search", debounced],
    queryFn: () => searchService.global(debounced),
    enabled: active,
    staleTime: 30_000,
  });
  const pending = enabled && query.trim().length >= SEARCH_MIN_LENGTH && (query.trim() !== debounced || result.isFetching);
  return { groups: active ? (result.data ?? NO_GROUPS) : NO_GROUPS, pending, isError: active && result.isError };
}
