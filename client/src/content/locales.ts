/** Ngôn ngữ của landing: `vi` là mặc định (URL không tiền tố), `en` nằm dưới `/en`. */
export const LOCALES = ["vi", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "vi";

export function isLocale(value: string | undefined | null): value is Locale {
  return LOCALES.includes(value as Locale);
}

/** Thêm tiền tố ngôn ngữ cho đường dẫn nội bộ ("/blog" -> "/en/blog"); link ngoài, "#mục" và mailto: giữ nguyên. */
export function localizePath(locale: Locale, href: string): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  if (locale === DEFAULT_LOCALE) return href;
  return href === "/" ? `/${locale}` : `/${locale}${href}`;
}

/**
 * Bỏ tiền tố ngôn ngữ khỏi pathname ("/en/blog" -> "/blog").
 * Cũng bỏ "/vi": khi render phía server, usePathname() thấy đường dẫn đã rewrite ("/vi/blog") trong khi
 * trình duyệt thấy "/blog" -> phải chuẩn hóa để HTML server và client khớp (tránh lỗi hydrate).
 */
export function stripLocale(pathname: string): string {
  for (const l of LOCALES) {
    if (pathname === `/${l}`) return "/";
    if (pathname.startsWith(`/${l}/`)) return pathname.slice(l.length + 1);
  }
  return pathname;
}

export const OG_LOCALE: Record<Locale, string> = { vi: "vi_VN", en: "en_US" };
