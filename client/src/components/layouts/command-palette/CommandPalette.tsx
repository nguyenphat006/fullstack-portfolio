"use client";

import React, { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Clock, Loader2, Search, X } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { getIconByName } from "@/constants/iconMap";
import { normalizeText } from "@/lib/text/normalize";
import type { SearchResult } from "@/services/search.service";
import { searchRoutes, type PaletteRoute } from "./searchNavigation";
import { useRecentSearch, type RecentItem } from "./recentSearch";
import { useGlobalSearch } from "./useGlobalSearch";

export interface PaletteAction {
  key: string;
  label: string;
  icon: React.ReactNode;
  onRun: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  /** Màn hình theo menu đã lọc quyền `_VIEW` */
  routes: PaletteRoute[];
  actions: PaletteAction[];
  onNavigate: (url: string) => void;
  userId?: number;
}

function RecordThumb({ result }: { result: SearchResult }) {
  // eslint-disable-next-line @next/next/no-img-element
  if (result.image) return <img src={result.image} alt="" className="palette-thumb" loading="lazy" />;
  return null;
}

/**
 * Tìm kiếm toàn cục (mở từ ô tìm trên sidebar hoặc Ctrl+K):
 * - chưa gõ: từ khóa gần đây · mục mở gần đây · thao tác nhanh;
 * - đang gõ: màn hình (tên / nhóm / mã phân hệ, không dấu) + bản ghi theo mã / tên từ `/search/` (backend lọc RBAC) + thao tác.
 * Chọn một mục → lưu vào lịch sử (theo người dùng) rồi mở.
 */
export function CommandPalette({ open, onClose, routes, actions, onNavigate, userId }: CommandPaletteProps) {
  const t = useTranslations("layout");
  const [query, setQuery] = useState("");
  const q = normalizeText(query);
  const recent = useRecentSearch(userId);
  const { groups, pending } = useGlobalSearch(query, open);

  const screens = useMemo(() => (q ? searchRoutes(routes, query, 6) : []), [q, query, routes]);
  const quick = useMemo(() => (q ? actions.filter((a) => normalizeText(a.label).includes(q)) : actions), [q, actions]);

  const close = () => {
    onClose();
    setQuery("");
  };
  const open_ = (item: RecentItem) => {
    if (query.trim()) recent.addQuery(query);
    recent.addItem(item);
    close();
    onNavigate(item.url);
  };
  const run = (fn: () => void) => {
    close();
    fn();
  };

  const hasResults = screens.length > 0 || groups.length > 0 || quick.length > 0;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && close()}>
      <DialogContent className="top-[12vh] translate-y-0 overflow-hidden p-0 sm:max-w-[600px]" showCloseButton={false}>
        <DialogTitle className="sr-only">{t("quickSearch")}</DialogTitle>
        <DialogDescription className="sr-only">{t("palette.description")}</DialogDescription>
        <Command shouldFilter={false} className="[&_[cmdk-group-heading]]:text-xs [&_[cmdk-item]]:py-2">
          <CommandInput placeholder={t("palette.placeholder")} value={query} onValueChange={setQuery} aria-label={t("quickSearch")} />
          <CommandList className="max-h-[420px]">
            {!pending && !hasResults && <CommandEmpty>{query ? t("palette.noResults") : t("palette.typeToSearch")}</CommandEmpty>}

            {!q && recent.queries.length > 0 && (
              <CommandGroup heading={t("palette.recentQueries")}>
                {recent.queries.map((text) => (
                  <CommandItem key={`q:${text}`} value={`q:${text}`} onSelect={() => setQuery(text)}>
                    <Search />
                    <span className="flex-1 truncate">{text}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {!q && recent.items.length > 0 && (
              <CommandGroup heading={t("palette.recent")}>
                {recent.items.map((item) => (
                  <CommandItem key={`r:${item.url}`} value={`r:${item.url}`} onSelect={() => open_(item)}>
                    {item.kind === "screen" ? getIconByName(item.icon) : <Clock />}
                    {item.code && <span className="palette-code">{item.code}</span>}
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.group && <span className="text-xs text-muted-foreground">{item.group}</span>}
                  </CommandItem>
                ))}
                <CommandItem value="r:clear" onSelect={recent.clear} className="text-muted-foreground">
                  <X />
                  <span>{t("palette.clearHistory")}</span>
                </CommandItem>
              </CommandGroup>
            )}

            {screens.length > 0 && (
              <CommandGroup heading={t("palette.screens")}>
                {screens.map((route) => (
                  <CommandItem
                    key={route.key}
                    value={`s:${route.key}`}
                    onSelect={() => open_({ url: route.key, label: route.label, kind: "screen", group: route.group, icon: route.icon })}
                  >
                    {getIconByName(route.icon)}
                    <span className="flex-1 truncate">{route.label}</span>
                    {route.group && <span className="text-xs text-muted-foreground">{route.group}</span>}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {groups.map((group) => (
              <CommandGroup key={group.module_code} heading={group.module_name}>
                {group.results.map((r) => (
                  <CommandItem
                    key={`${group.module_code}:${r.id}`}
                    value={`d:${group.module_code}:${r.id}`}
                    onSelect={() => open_({ url: r.url, label: r.title, kind: "record", code: r.code, group: group.module_name })}
                  >
                    <RecordThumb result={r} />
                    <span className="palette-code">{r.code}</span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate">{r.title}</span>
                      {r.subtitle && <span className="truncate text-xs text-muted-foreground">{r.subtitle}</span>}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}

            {pending && (
              <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                {t("palette.searching")}
              </div>
            )}

            {quick.length > 0 && (
              <CommandGroup heading={t("palette.quickActions")}>
                {quick.map((action) => (
                  <CommandItem key={action.key} value={`a:${action.key}`} onSelect={() => run(action.onRun)}>
                    {action.icon}
                    <span>{action.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
          <div className="flex gap-4 border-t px-4 py-2 text-xs text-muted-foreground">
            <span>{t("palette.hintMove")}</span>
            <span>{t("palette.hintOpen")}</span>
            <span>{t("palette.hintClose")}</span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
