"use client";

import React, { useMemo } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { House } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useBreadcrumbStore } from "@/stores/useBreadcrumbStore";
import { useNavigation } from "@/hooks/useNavigation";
import { cn } from "@/lib/utils";
import type { NavigationItem } from "@/services/navigation.service";

/** Trang có thật nhưng không nằm trong menu sidebar */
const EXTRA_ROUTES: Record<string, "profile"> = {
  "/profile": "profile",
};

/** Segment hành động ở cuối đường dẫn */
const ACTION_LABELS: Record<string, "create" | "edit"> = {
  new: "create",
  create: "create",
  edit: "edit",
};

interface RouteInfo {
  label: string;
  /** Có trang thật để điều hướng tới hay không (nhóm menu chỉ là tiêu đề) */
  linkable: boolean;
}

/** Map đường dẫn -> nhãn từ cây menu (ModuleRegistry) — nguồn duy nhất cho tên màn hình. */
function buildRouteMap(nav: NavigationItem[] | undefined, extraLabel: (key: "profile") => string): Map<string, RouteInfo> {
  const map = new Map<string, RouteInfo>();
  for (const [path, key] of Object.entries(EXTRA_ROUTES)) map.set(path, { label: extraLabel(key), linkable: true });

  const visit = (item: NavigationItem) => {
    if (item.key?.startsWith("/")) map.set(item.key, { label: item.label, linkable: true });
    const children = item.children ?? [];
    children.forEach(visit);
    // Nhóm menu: gán nhãn cho tiền tố chung của các màn hình con (vd. /master-data)
    if (!item.key?.startsWith("/") && children.length > 0) {
      const prefixes = new Set(
        children.filter((c) => c.key?.startsWith("/")).map((c) => c.key.split("/").slice(0, 2).join("/")),
      );
      if (prefixes.size === 1) {
        const prefix = [...prefixes][0];
        if (!map.has(prefix)) map.set(prefix, { label: item.label, linkable: false });
      }
    }
  };
  nav?.forEach(visit);
  return map;
}

export function DynamicBreadcrumb() {
  const t = useTranslations("layout");
  const tc = useTranslations("common");
  const pathname = usePathname();
  const labels = useBreadcrumbStore((s) => s.labels);
  const { data: nav } = useNavigation();
  const routeMap = useMemo(() => buildRouteMap(nav, (key) => t(key)), [nav, t]);

  // "/dashboard" là trang chủ của khu quản trị -> không thêm crumb thứ hai sau biểu tượng nhà
  const segments = pathname === "/dashboard" ? [] : pathname.split("/").filter(Boolean);
  // Mỗi mục: nhãn + đường dẫn (null = chỉ chữ, không link); mục cuối là trang hiện tại
  const items: { title: React.ReactNode; href: string | null; current?: boolean }[] = [
    {
      title: (
        <span className="inline-flex items-center gap-1">
          <House className="size-3.5" />
          <span>{t("home")}</span>
        </span>
      ),
      href: "/dashboard",
    },
  ];

  if (segments.length === 0) {
    items.push({ title: routeMap.get("/dashboard")?.label ?? t("overview"), href: null, current: true });
  }

  let path = "";
  segments.forEach((segment, index) => {
    path += `/${segment}`;
    const isLast = index === segments.length - 1;
    const route = routeMap.get(path);

    // Ưu tiên: nhãn động do trang chi tiết đăng ký (useBreadcrumbTitle) -> menu -> id / hành động -> segment
    const title =
      labels[path] ??
      route?.label ??
      (/^\d+$/.test(segment) ? `#${segment}` : ACTION_LABELS[segment] ? tc(`actions.${ACTION_LABELS[segment]}`) : segment.replace(/-/g, " "));

    if (isLast) items.push({ title, href: null, current: true });
    else if (route?.linkable || /^\d+$/.test(segment)) items.push({ title, href: path });
    else if (route) items.push({ title, href: null }); // nhóm menu (không có trang thật) -> chỉ chữ
    // Segment trung gian không phải trang cũng không phải nhóm menu -> bỏ qua
  });

  return (
    <Breadcrumb>
      <BreadcrumbList className="flex-nowrap text-[13px]">
        {items.map((item, i) => (
          <React.Fragment key={i}>
            {i > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem className={cn("whitespace-nowrap", i > 0 && !item.current && "hidden md:inline-flex", item.current && "min-w-0")}>
              {item.current ? (
                <BreadcrumbPage className="max-w-[40vw] truncate font-medium xl:max-w-[32rem]">{item.title}</BreadcrumbPage>
              ) : item.href ? (
                <BreadcrumbLink asChild>
                  <Link href={item.href}>{item.title}</Link>
                </BreadcrumbLink>
              ) : (
                <span>{item.title}</span>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
