"use client";

import React, { useMemo } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusPage } from "@/components/common";
import { useNavigation } from "@/hooks/useNavigation";
import { usePermission } from "@/hooks/usePermission";
import type { NavigationItem } from "@/services/navigation.service";

/** Trang mọi người dùng đã đăng nhập đều vào được */
const ALWAYS_ALLOWED = ["/dashboard", "/profile", "/403"];

function collectRoutes(items: NavigationItem[] | undefined, acc: string[] = []): string[] {
  for (const item of items ?? []) {
    if (item.key?.startsWith("/")) acc.push(item.key);
    collectRoutes(item.children, acc);
  }
  return acc;
}

/** "/users/5" thuộc màn hình "/users" */
function belongsTo(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`);
}

/**
 * Chặn truy cập trang theo quyền: chỉ cho vào các màn hình có trong cây menu (backend đã lọc theo quyền
 * <MODULE>_VIEW / _READ). Gõ thẳng URL không có quyền -> trang 403 thay vì trang lỗi API.
 * Đây là lớp trải nghiệm — bảo mật thật nằm ở API (ModulePermissionChecker).
 */
export function RouteGuard({ children }: { children: React.ReactNode }) {
  const t = useTranslations("errors");
  const pathname = usePathname();
  const { isSuperUser } = usePermission();
  const { data: nav, isLoading } = useNavigation();
  const routes = useMemo(() => collectRoutes(nav), [nav]);

  if (isSuperUser || ALWAYS_ALLOWED.includes(pathname)) return <>{children}</>;
  if (isLoading && !nav)
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-5 w-full" />
        ))}
      </div>
    );
  if (routes.some((route) => belongsTo(pathname, route))) return <>{children}</>;

  return (
    <StatusPage
      status="403"
      title={t("forbidden.title")}
      subTitle={t("forbidden.routeHint")}
    />
  );
}

export default RouteGuard;
