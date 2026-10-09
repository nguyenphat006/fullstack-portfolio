"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useBreadcrumbStore } from "@/stores/useBreadcrumbStore";

/**
 * Custom Hook cho phép bất kỳ trang chi tiết thực thể nào (như /users/1, /products/2, ...)
 * đăng ký tiêu đề/tên hiển thị động cho phần tử Breadcrumb tương ứng trên Topbar.
 *
 * @param title Tên hoặc định danh hiển thị của thực thể (ví dụ: user.full_name || user.username)
 */
export function useBreadcrumbTitle(title?: string | null) {
  const pathname = usePathname();
  const setLabel = useBreadcrumbStore((s) => s.setLabel);
  const removeLabel = useBreadcrumbStore((s) => s.removeLabel);

  useEffect(() => {
    if (title && pathname) {
      setLabel(pathname, title);
    }
    return () => {
      if (pathname) {
        removeLabel(pathname);
      }
    };
  }, [title, pathname, setLabel, removeLabel]);
}

export default useBreadcrumbTitle;
