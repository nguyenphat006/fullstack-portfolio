"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Search } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getIconByName } from "@/constants/iconMap";
import type { NavigationItem } from "@/services/navigation.service";
import type { AppBranding } from "@/hooks/useSystemSettings";
import { cn } from "@/lib/utils";
import { BrandMark } from "./BrandMark";

interface AppSidebarProps {
  nav: NavigationItem[] | undefined;
  loading: boolean;
  branding: AppBranding;
  /** Chỉ hiện icon (desktop thu gọn) */
  compact: boolean;
  onNavigate?: () => void;
  /** Mở tìm kiếm toàn cục (Ctrl+K) */
  onOpenSearch: () => void;
  /** Nhãn phím tắt hiển thị, vd. "Ctrl K" / "⌘K" */
  searchShortcut: string;
}

const isActive = (pathname: string, key: string) => (pathname === key || pathname.startsWith(`${key}/`));

/** Sidebar tối cố định: logo + menu động từ ModuleRegistries (đã lọc quyền), cuộn độc lập */
export function AppSidebar({ nav, loading, branding, compact, onNavigate, onOpenSearch, searchShortcut }: AppSidebarProps) {
  const t = useTranslations("layout");
  const pathname = usePathname();
  const [closed, setClosed] = useState<Set<string>>(new Set());

  const linkClass = (active: boolean) =>
    cn(
      "flex h-9 items-center gap-3 rounded-md px-3 text-sm transition-colors",
      "sider-link", active && "is-active",
      compact && "justify-center px-0",
    );

  const renderLeaf = (item: NavigationItem, nested = false) => {
    const active = isActive(pathname, item.key);
    const link = (
      <Link key={item.key} href={item.key} onClick={onNavigate} className={cn(linkClass(active), nested && !compact && "pl-9")} aria-current={active ? "page" : undefined}>
        {!nested || compact ? getIconByName(item.icon) : null}
        {!compact && <span className="truncate">{item.label}</span>}
      </Link>
    );
    return compact ? (
      <Tooltip key={item.key}>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    ) : (
      link
    );
  };

  const renderGroup = (item: NavigationItem) => {
    const children = item.children ?? [];
    const groupKey = item.key || item.code;
    const hasActive = children.some((c) => isActive(pathname, c.key));
    if (compact) {
      return (
        <DropdownMenu key={groupKey}>
          <DropdownMenuTrigger asChild>
            <button type="button" className={linkClass(hasActive)} aria-label={item.label}>
              {getIconByName(item.icon)}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start">
            <DropdownMenuLabel>{item.label}</DropdownMenuLabel>
            {children.map((c) => (
              <DropdownMenuItem key={c.key} asChild>
                <Link href={c.key}>{c.label}</Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
    const open = !closed.has(groupKey) || hasActive;
    return (
      <div key={groupKey}>
        <button
          type="button"
          className={cn(linkClass(false), "w-full", hasActive && "text-white")}
          aria-expanded={open}
          onClick={() =>
            setClosed((prev) => {
              const next = new Set(prev);
              if (next.has(groupKey)) next.delete(groupKey);
              else next.add(groupKey);
              return next;
            })
          }
        >
          {getIconByName(item.icon)}
          <span className="flex-1 truncate text-left">{item.label}</span>
          <ChevronDown className={cn("size-4 transition-transform", !open && "-rotate-90")} />
        </button>
        {open && <div className="mt-0.5 flex flex-col gap-0.5">{children.map((c) => renderLeaf(c, true))}</div>}
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col" style={{ background: "var(--c-sider-bg)" }}>
      <div className={cn("flex h-16 shrink-0 items-center gap-3 border-b border-white/10", compact ? "justify-center" : "px-5")}>
        <BrandMark logoUrl={branding.logoUrl} name={branding.name} />
        {!compact && (
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[15px] font-bold tracking-wide text-white">
              <span className="truncate">{branding.name}</span>
              {branding.badge && <span className="rounded bg-blue-800/60 px-1.5 text-[9px] leading-4 font-semibold text-blue-200">{branding.badge}</span>}
            </div>
            {branding.tagline && <div className="truncate text-[11px] leading-3.5 text-slate-400">{branding.tagline}</div>}
          </div>
        )}
      </div>
      {/* Ô tìm kiếm cố định (không cuộn theo menu) */}
      <div className={cn("shrink-0 border-b border-white/10", compact ? "flex justify-center py-2" : "p-2")}>
        {compact ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" className="sider-search sider-search--icon" onClick={onOpenSearch} aria-label={t("quickSearch")}>
                <Search />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {t("quickSearch")} ({searchShortcut})
            </TooltipContent>
          </Tooltip>
        ) : (
          <button type="button" className="sider-search" onClick={onOpenSearch}>
            <Search />
            <span className="sider-search__label">{t("searchPlaceholder")}</span>
            <kbd>{searchShortcut}</kbd>
          </button>
        )}
      </div>
      <nav className="sidebar-scrollable-menu flex flex-1 flex-col gap-0.5 overflow-y-auto p-2" aria-label={t("mainMenu")}>
        {loading && !nav
          ? Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="my-1 h-8 w-full bg-white/10" />)
          : nav?.map((item) => (item.children?.length ? renderGroup(item) : renderLeaf(item)))}
      </nav>
    </div>
  );
}
