import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale } from "./config";

/**
 * next-intl không dùng tiền tố URL (/vi, /en): ứng dụng nội bộ, ngôn ngữ lấy từ cookie NEXT_LOCALE.
 * Thiếu khóa ở `en` -> dùng bản tiếng Việt (tệp vi là nguồn chuẩn).
 */
export default getRequestConfig(async () => {
  const store = await cookies();
  const cookieLocale = store.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;
  const vi = (await import("../../messages/vi")).default;
  const messages = locale === "vi" ? vi : deepMerge(vi, (await import("../../messages/en")).default);
  return { locale, messages, timeZone: "Asia/Ho_Chi_Minh" };
});

type Tree = { [key: string]: string | Tree };

function deepMerge(base: Tree, override: Tree): Tree {
  const out: Tree = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const prev = out[key];
    out[key] = typeof value === "object" && typeof prev === "object" ? deepMerge(prev, value) : value;
  }
  return out;
}
