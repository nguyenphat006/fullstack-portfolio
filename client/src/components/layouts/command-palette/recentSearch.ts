"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { STORAGE_KEYS } from "@/config/app";

/** Một mục đã mở gần đây: màn hình (từ menu) hoặc bản ghi (từ kết quả tìm kiếm) */
export interface RecentItem {
  url: string;
  label: string;
  kind: "screen" | "record";
  code?: string | null;
  /** Nhóm menu hoặc tên phân hệ */
  group?: string | null;
  icon?: string | null;
}

interface RecentState {
  items: RecentItem[];
  queries: string[];
}

const MAX_ITEMS = 6;
const MAX_QUERIES = 5;
const EMPTY: RecentState = { items: [], queries: [] };

const storageKey = (userId?: number) => `${STORAGE_KEYS.recentSearch}_${userId ?? "anon"}`;

// Kho ngoài React (useSyncExternalStore): sidebar, layout và hộp tìm kiếm cùng đọc một nguồn, ghi ở đâu cũng cập nhật mọi nơi
const listeners = new Set<() => void>();
const snapshots = new Map<string, RecentState>();

function read(key: string): RecentState {
  const cached = snapshots.get(key);
  if (cached) return cached;
  let state = EMPTY;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || "null");
    if (parsed && Array.isArray(parsed.items) && Array.isArray(parsed.queries)) {
      state = {
        items: parsed.items.filter((x: RecentItem) => x && typeof x.url === "string" && typeof x.label === "string"),
        queries: parsed.queries.filter((x: unknown) => typeof x === "string"),
      };
    }
  } catch {
    // localStorage bị chặn / dữ liệu hỏng → bắt đầu rỗng
  }
  snapshots.set(key, state);
  return state;
}

function write(key: string, next: RecentState) {
  snapshots.set(key, next);
  try {
    window.localStorage.setItem(key, JSON.stringify(next));
  } catch {
    // localStorage đầy / bị chặn → chỉ giữ trong phiên
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Lịch sử tìm kiếm của từng người dùng (localStorage): 6 mục mở gần đây (màn hình + bản ghi) và 5 từ khóa gần đây.
 * Chỉ lưu nhãn / đường dẫn đã hiển thị, không lưu dữ liệu nghiệp vụ; quyền vẫn do backend kiểm tra khi mở.
 */
export function useRecentSearch(userId?: number) {
  const key = storageKey(userId);
  const state = useSyncExternalStore(
    subscribe,
    () => read(key),
    () => EMPTY,
  );

  const addItem = useCallback(
    (item: RecentItem) => {
      const cur = read(key);
      write(key, { ...cur, items: [item, ...cur.items.filter((x) => x.url !== item.url)].slice(0, MAX_ITEMS) });
    },
    [key],
  );
  const addQuery = useCallback(
    (query: string) => {
      const q = query.trim();
      if (!q) return;
      const cur = read(key);
      write(key, { ...cur, queries: [q, ...cur.queries.filter((x) => x.toLowerCase() !== q.toLowerCase())].slice(0, MAX_QUERIES) });
    },
    [key],
  );
  const clear = useCallback(() => write(key, EMPTY), [key]);

  return useMemo(() => ({ ...state, addItem, addQuery, clear }), [state, addItem, addQuery, clear]);
}
