"use client";

import { usePathname } from "next/navigation";
import { useNavigation } from "./useNavigation";
import type { NavigationItem } from "@/services/navigation.service";

/**
 * Hook tự động lấy Title và Subtitle (Description) 100% động từ CSDL ModuleRegistries.
 * Khớp trực tiếp theo moduleCode hoặc tự động suy luận theo pathname hiện tại của Sidebar.
 *
 * @param moduleCode (Tùy chọn) Mã phân hệ ví dụ: 'UNIT', 'USER', 'SETTINGS', 'DASHBOARD'.
 *                   Nếu không truyền, hook tự động tra cứu module tương ứng với URL hiện tại.
 */
export function useModuleHeader(moduleCode?: string) {
  const pathname = usePathname();
  const { data: navTree = [], isLoading } = useNavigation();

  // Đệ quy tìm kiếm module trong cây navigation (cùng nguồn dữ liệu với Sidebar Menu)
  const findModule = (items: NavigationItem[]): NavigationItem | null => {
    for (const item of items) {
      if (moduleCode && item.code === moduleCode) {
        return item;
      }
      if (!moduleCode && item.key && (item.key === pathname || (item.key !== "/" && pathname?.startsWith(item.key)))) {
        return item;
      }
      if (item.children && item.children.length > 0) {
        const foundChild = findModule(item.children);
        if (foundChild) return foundChild;
      }
    }
    return null;
  };

  const currentModule = findModule(navTree);

  const title = currentModule?.label || "";
  const subtitle = currentModule?.description || "";
  const icon = currentModule?.icon || null;

  return {
    title,
    subtitle,
    icon,
    module: currentModule,
    isLoading,
  };
}
