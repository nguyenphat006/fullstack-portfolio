import type { ModuleRegistryItem } from "../../types";

/* ──────────────────────────────────────────
   Nhóm cha-con: Parent đứng trước, Children
   thụt lề ngay bên dưới.
   ────────────────────────────────────────── */

export function sortHierarchicalList(items: ModuleRegistryItem[]): ModuleRegistryItem[] {
  if (!items || items.length === 0) return [];

  const rootItems: ModuleRegistryItem[] = [];
  const childMap = new Map<string, ModuleRegistryItem[]>();
  const moduleCodeSet = new Set(items.map((m) => m.module_code));

  for (const item of items) {
    const pCode = item.parent_code?.trim();
    if (pCode && moduleCodeSet.has(pCode)) {
      const list = childMap.get(pCode) || [];
      list.push(item);
      childMap.set(pCode, list);
    } else {
      rootItems.push(item);
    }
  }

  rootItems.sort((a, b) => (a.sort_order - b.sort_order) || (a.id - b.id));

  const result: ModuleRegistryItem[] = [];
  for (const root of rootItems) {
    result.push(root);
    const children = childMap.get(root.module_code);
    if (children && children.length > 0) {
      children.sort((a, b) => (a.sort_order - b.sort_order) || (a.id - b.id));
      result.push(...children);
    }
  }

  return result;
}
