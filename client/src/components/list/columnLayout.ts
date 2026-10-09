import type { ListPreferences, PinSide } from "./useListPreferences";
import type { ListColumn } from "./types";

export interface ResolvedColumns<T> {
  /** Mọi cột theo thứ tự người dùng (kể cả cột ẩn) — dùng cho ⚙ */
  ordered: ListColumn<T>[];
  /** Cột đang hiện, đã gom ghim trái → giữa → ghim phải */
  visible: ListColumn<T>[];
  isVisible: (col: ListColumn<T>) => boolean;
  pinOf: (col: ListColumn<T>) => PinSide;
  orderKeys: string[];
}

export function resolveColumns<T>(columns: ListColumn<T>[], prefs: ListPreferences): ResolvedColumns<T> {
  const keys = columns.map((c) => c.key);
  const orderKeys = [...prefs.order.filter((k) => keys.includes(k)), ...keys.filter((k) => !prefs.order.includes(k))];
  const byKey = new Map(columns.map((c) => [c.key, c]));
  const ordered = orderKeys.map((k) => byKey.get(k)!);

  const isVisible = (c: ListColumn<T>) => c.hideable === false || (prefs.visibility[c.key] ?? !c.defaultHidden);
  const pinOf = (c: ListColumn<T>): PinSide => (c.key in prefs.pinned ? prefs.pinned[c.key] : (c.pinned ?? false));

  const shown = ordered.filter(isVisible);
  const visible = [
    ...shown.filter((c) => pinOf(c) === "left"),
    ...shown.filter((c) => !pinOf(c)),
    ...shown.filter((c) => pinOf(c) === "right"),
  ];
  return { ordered, visible, isVisible, pinOf, orderKeys };
}

/** Đổi chỗ cột với cột đang hiện liền kề (trái / phải) */
export function moveColumnKey(orderKeys: string[], visibleKeys: string[], key: string, dir: -1 | 1): string[] {
  const vi = visibleKeys.indexOf(key);
  const neighbor = visibleKeys[vi + dir];
  if (vi < 0 || !neighbor) return orderKeys;
  const next = [...orderKeys];
  const a = next.indexOf(key);
  const b = next.indexOf(neighbor);
  [next[a], next[b]] = [next[b], next[a]];
  return next;
}

/** Đo độ rộng vừa nội dung của cột (ô có `data-col`) */
export function measureColumnWidth(container: HTMLElement | null, key: string, min = 80, max = 480): number | null {
  if (!container) return null;
  const cells = container.querySelectorAll<HTMLElement>(`[data-col="${CSS.escape(key)}"]`);
  if (!cells.length) return null;
  let widest = 0;
  const range = document.createRange();
  cells.forEach((cell) => {
    range.selectNodeContents(cell);
    const style = getComputedStyle(cell);
    const padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    widest = Math.max(widest, range.getBoundingClientRect().width + padding + 4);
  });
  return Math.round(Math.min(max, Math.max(min, widest)));
}
