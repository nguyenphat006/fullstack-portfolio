"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Languages } from "lucide-react";
import { LOCALES, localizePath, stripLocale, type Locale } from "@/content/locales";
import { useLanding } from "@/content/provider";

/** Chuyển ngôn ngữ giữ nguyên trang hiện tại: /blog <-> /en/blog. */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, shared } = useLanding();
  const pathname = usePathname();
  const target: Locale = LOCALES.find((l) => l !== locale) ?? locale;
  const href = localizePath(target, stripLocale(pathname));
  // Tên truy cập phải bắt đầu bằng chữ nhìn thấy (EN / VI) để khớp quy tắc label-in-name của WCAG
  const label = `${target.toUpperCase()} - ${shared.ui.language.label}: ${shared.ui.language[target]}`;

  return (
    <Link href={href} hrefLang={target} lang={target} aria-label={label} title={label} className={className} prefetch={false}>
      <span className="relative flex size-full items-center justify-center">
        <Languages className="size-[55%]" aria-hidden />
        <span aria-hidden="true" className="absolute bottom-0 right-0 rounded-sm bg-foreground px-[3px] text-[9px] font-bold uppercase leading-[14px] text-background">
          {target}
        </span>
      </span>
    </Link>
  );
}
