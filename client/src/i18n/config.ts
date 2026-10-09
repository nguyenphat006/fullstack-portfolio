/** Ngôn ngữ giao diện. Tiếng Việt là mặc định và là nguồn chuẩn của tệp chữ (messages/vi). */
export const LOCALES = ["vi", "en"] as const;
export type AppLocale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: AppLocale = "vi";

/** Cookie lưu ngôn ngữ đã chọn (đọc ở server khi render và ở axios để gửi Accept-Language) */
export const LOCALE_COOKIE = "NEXT_LOCALE";

export const LOCALE_LABELS: Record<AppLocale, string> = { vi: "Tiếng Việt", en: "English" };

export function isLocale(value: unknown): value is AppLocale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** Ngôn ngữ hiện tại ở trình duyệt (cookie) — dùng ngoài cây React (axios) */
export function readClientLocale(): AppLocale {
  if (typeof document === "undefined") return DEFAULT_LOCALE;
  const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`));
  const value = match ? decodeURIComponent(match[1]) : undefined;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}
