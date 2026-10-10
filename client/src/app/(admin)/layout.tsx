import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import "flag-icons/css/flag-icons.min.css";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import AppProviders from "@/providers/AppProviders";
import { APP_CONFIG } from "@/config/app";
import { THEME_INIT_SCRIPT } from "@/stores/useThemeStore";

export const metadata: Metadata = {
  // Trang con chỉ cần khai báo `title: "Tên trang"` -> tự thành "Tên trang | <APP_CONFIG.name>"
  title: {
    default: APP_CONFIG.name,
    template: `%s | ${APP_CONFIG.name}`,
  },
  description: APP_CONFIG.description,
  // Khu quản trị không được lập chỉ mục
  robots: { index: false, follow: false },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  return (
    // data-theme được script gán trước khi hydrate -> cần suppressHydrationWarning
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        {/* Chữ + ngôn ngữ từ src/i18n/request.ts (cookie NEXT_LOCALE) chuyền xuống client component */}
        <NextIntlClientProvider>
          <QueryProvider>
            <AppProviders>{children}</AppProviders>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
