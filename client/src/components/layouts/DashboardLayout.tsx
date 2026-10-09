"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Check, KeyRound, Languages, LogOut, Monitor, Moon, PanelLeftClose, PanelLeftOpen, Sigma, Sun, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { authService } from "@/modules/auth/services/auth.service";
import { useAuthStore } from "@/stores/useAuthStore";
import ChangePasswordModal from "@/components/auth/ChangePasswordModal";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { useNavigation } from "@/hooks/useNavigation";
import { FloatingTaskWidget, NumberFormatModal } from "@/components/common";
import { APP_CONFIG } from "@/config/app";
import { useThemeStore, type ThemeMode } from "@/stores/useThemeStore";
import { useHotkey } from "@/hooks/useHotkey";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { AppSidebar } from "./AppSidebar";
import { CommandPalette, flattenNavigation, useRecentSearch, type PaletteAction } from "./command-palette";
import { NotificationBell } from "./notifications/NotificationBell";
import { DynamicBreadcrumb } from "./DynamicBreadcrumb";
import { cn } from "@/lib/utils";
import { LOCALES } from "@/i18n/config";
import { useChangeLocale } from "@/i18n/useChangeLocale";

const THEME_OPTIONS: { mode: ThemeMode; label: "themeLight" | "themeDark" | "themeSystem"; icon: React.ReactNode }[] = [
  { mode: "light", label: "themeLight", icon: <Sun /> },
  { mode: "dark", label: "themeDark", icon: <Moon /> },
  { mode: "system", label: "themeSystem", icon: <Monitor /> },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

/** Khung ứng dụng: sidebar tối cố định (logo · ô tìm kiếm toàn cục · menu; Sheet trên mobile) · topbar (breadcrumb, thông báo, tài khoản) · nội dung */
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const t = useTranslations("layout");
  const tc = useTranslations("common");
  const { locale, changeLocale } = useChangeLocale();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 1023px)");
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [numberFormatModalOpen, setNumberFormatModalOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { data: navData, isLoading: isNavLoading } = useNavigation();
  const themeMode = useThemeStore((s) => s.mode);
  const resolvedTheme = useThemeStore((s) => s.resolved);
  const setThemeMode = useThemeStore((s) => s.setMode);

  // Nhận diện từ Cấu hình hệ thống (APP_CONFIG là dự phòng); tiêu đề tab theo tên đã cấu hình
  const branding = useSystemSettings();
  useEffect(() => {
    if (branding.name !== APP_CONFIG.name && document.title.includes(APP_CONFIG.name)) {
      document.title = document.title.replace(APP_CONFIG.name, branding.name);
    }
  }, [branding.name, pathname]);

  // Ctrl+K / ⌘K: tìm nhanh màn hình theo menu đã lọc quyền
  const [paletteOpen, setPaletteOpen] = useState(false);
  const paletteRoutes = useMemo(() => flattenNavigation(navData), [navData]);
  const { addItem: addRecent } = useRecentSearch(user?.id);
  const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
  const shortcut = isMac ? "⌘K" : "Ctrl K";
  useHotkey("mod+k", () => setPaletteOpen((v) => !v));

  useEffect(() => {
    // Màn hình vừa mở (theo menu) vào lịch sử "Mở gần đây"
    const route = paletteRoutes.find((r) => r.key === pathname && r.key !== "/dashboard");
    if (route) addRecent({ url: route.key, label: route.label, kind: "screen", group: route.group, icon: route.icon });
  }, [pathname, paletteRoutes, addRecent]);

  const handleLogout = async () => {
    try {
      const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null;
      if (refreshToken) await authService.logout(refreshToken);
    } catch {
      // Bỏ qua lỗi mạng khi đăng xuất
    } finally {
      await logout();
      router.push("/login");
    }
  };

  const paletteActions: PaletteAction[] = [
    { key: "profile", label: t("profile"), icon: <User />, onRun: () => router.push("/profile") },
    {
      key: "theme",
      label: resolvedTheme === "dark" ? t("switchToLight") : t("switchToDark"),
      icon: resolvedTheme === "dark" ? <Sun /> : <Moon />,
      onRun: () => setThemeMode(resolvedTheme === "dark" ? "light" : "dark"),
    },
    {
      key: "language",
      label: locale === "vi" ? t("switchToEnglish") : t("switchToVietnamese"),
      icon: <Languages />,
      onRun: () => changeLocale(locale === "vi" ? "en" : "vi"),
    },
    { key: "password", label: t("changePassword"), icon: <KeyRound />, onRun: () => setPasswordModalOpen(true) },
    { key: "logout", label: tc("actions.logout"), icon: <LogOut />, onRun: handleLogout },
  ];

  const displayName = user?.full_name || user?.username || t("account");
  const roleText = user?.is_superuser ? t("superAdmin") : user?.role_codes?.[0] || t("staff");
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const compact = collapsed && !isMobile;

  return (
    <div className="flex min-h-screen bg-[var(--c-layout)]">
      {/* Sidebar desktop: cố định, cuộn độc lập */}
      {!isMobile && (
        <aside className={cn("sticky top-0 h-screen shrink-0 transition-[width] duration-200", compact ? "w-16" : "w-64")}>
          <AppSidebar nav={navData} loading={isNavLoading} branding={branding} compact={compact} onOpenSearch={() => setPaletteOpen(true)} searchShortcut={shortcut} />
        </aside>
      )}
      {/* Sidebar mobile: ngăn trượt */}
      <Sheet open={isMobile && mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-64 border-0 p-0" style={{ background: "var(--c-sider-bg)" }}>
          <SheetTitle className="sr-only">{t("menu")}</SheetTitle>
          <AppSidebar
            nav={navData}
            loading={isNavLoading}
            branding={branding}
            compact={false}
            onNavigate={() => setMobileNavOpen(false)}
            onOpenSearch={() => {
              setMobileNavOpen(false);
              setPaletteOpen(true);
            }}
            searchShortcut={shortcut}
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-[var(--c-header-border)] bg-[var(--c-header-bg)] px-3 backdrop-blur-md lg:px-7">
          <div className="flex min-w-0 items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label={isMobile ? t("openMenu") : collapsed ? t("expandMenu") : t("collapseMenu")}
              onClick={() => (isMobile ? setMobileNavOpen(true) : setCollapsed(!collapsed))}
              className="text-muted-foreground"
            >
              {isMobile || collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
            </Button>
            <DynamicBreadcrumb />
          </div>

          <div className="flex shrink-0 items-center gap-1 lg:gap-3">

            <NotificationBell />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-accent lg:px-2.5" aria-label={t("account")}>
                  <Avatar className="size-8">
                    <AvatarFallback className="text-xs font-semibold text-white" style={{ background: "var(--c-brand-gradient)" }}>
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  {!isMobile && (
                    <span className="flex flex-col text-left leading-tight whitespace-nowrap">
                      <span className="text-[13px] font-semibold text-foreground">{displayName}</span>
                      <span className="text-[11px] text-muted-foreground">{roleText}</span>
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel className="flex flex-col">
                  <span className="font-semibold">{displayName}</span>
                  <span className="text-xs font-normal text-muted-foreground">{roleText}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => router.push("/profile")}>
                  <User />
                  {t("profile")}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setNumberFormatModalOpen(true)}>
                  <Sigma />
                  {t("numberFormat")}
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    {resolvedTheme === "dark" ? <Moon /> : <Sun />}
                    {t("appearance")}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {THEME_OPTIONS.map((opt) => (
                      <DropdownMenuItem key={opt.mode} onSelect={() => setThemeMode(opt.mode)}>
                        {opt.icon}
                        {t(opt.label)}
                        {themeMode === opt.mode && <Check className="ml-auto" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Languages />
                    {tc("language.label")}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {LOCALES.map((loc) => (
                      <DropdownMenuItem key={loc} onSelect={() => changeLocale(loc)}>
                        {tc(`language.${loc}`)}
                        {locale === loc && <Check className="ml-auto" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuItem onSelect={() => setPasswordModalOpen(true)}>
                  <KeyRound />
                  {t("changePassword")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onSelect={handleLogout}>
                  <LogOut />
                  {tc("actions.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 px-3 py-4 lg:px-7 lg:py-6">
          <RouteGuard>{children}</RouteGuard>
        </main>

        <footer className="px-7 py-4 text-center text-xs text-muted-foreground/80">
          {branding.name} ©{new Date().getFullYear()}
          {branding.owner ? ` — ${branding.owner}` : ""}
        </footer>
      </div>

      <ChangePasswordModal open={passwordModalOpen} onCancel={() => setPasswordModalOpen(false)} />
      <NumberFormatModal open={numberFormatModalOpen} onCancel={() => setNumberFormatModalOpen(false)} />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} routes={paletteRoutes} actions={paletteActions} onNavigate={(url) => router.push(url)} userId={user?.id} />
      {/* Widget theo dõi tác vụ xuất dữ liệu ngầm toàn cục */}
      <FloatingTaskWidget />
    </div>
  );
}
