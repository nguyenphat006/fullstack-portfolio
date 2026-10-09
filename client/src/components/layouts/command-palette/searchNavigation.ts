import { normalizeText } from "@/lib/text/normalize";
import type { NavigationItem } from "@/services/navigation.service";

/** Một màn hình có thể mở được (lá của cây menu, key là đường dẫn) */
export interface PaletteRoute {
  key: string;
  label: string;
  /** Nhãn nhóm cha, vd. "Danh mục" */
  group?: string;
  icon?: string | null;
  description?: string | null;
  /** Chuỗi đã chuẩn hóa để tìm */
  haystack: string;
}

export function flattenNavigation(items: NavigationItem[] | undefined, group?: string, acc: PaletteRoute[] = []): PaletteRoute[] {
  for (const item of items ?? []) {
    if (item.key?.startsWith("/")) {
      acc.push({
        key: item.key,
        label: item.label,
        group,
        icon: item.icon,
        description: item.description,
        haystack: normalizeText(`${item.label} ${group ?? ""} ${item.code} ${item.key}`),
      });
    }
    if (item.children?.length) flattenNavigation(item.children, item.label, acc);
  }
  return acc;
}

/**
 * Tìm màn hình: mọi từ khóa phải xuất hiện (không phân biệt dấu).
 * Ưu tiên nhãn bắt đầu bằng từ khóa, rồi nhãn chứa từ khóa, rồi khớp ở nhóm / mã.
 */
export function searchRoutes(routes: PaletteRoute[], query: string, limit = 8): PaletteRoute[] {
  const q = normalizeText(query);
  if (!q) return [];
  const terms = q.split(/\s+/);
  return routes
    .filter((r) => terms.every((t) => r.haystack.includes(t)))
    .map((r) => {
      const label = normalizeText(r.label);
      const score = label.startsWith(q) ? 0 : label.includes(q) ? 1 : 2;
      return { r, score };
    })
    .sort((a, b) => a.score - b.score || a.r.label.localeCompare(b.r.label, "vi"))
    .slice(0, limit)
    .map((x) => x.r);
}
