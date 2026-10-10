import { BLOG_CONTENT } from "./blog";
import { HOME_CONTENT } from "./home";
import type { Locale } from "./locales";
import { PROJECT_CONTENT } from "./project";
import { SHARED_CONTENT } from "./shared";

export * from "./locales";

/** Toàn bộ nội dung landing theo ngôn ngữ (server dùng trực tiếp; client lấy qua `useLanding()`). */
export function getContent(locale: Locale) {
  return {
    locale,
    shared: SHARED_CONTENT[locale],
    home: HOME_CONTENT[locale],
    blog: BLOG_CONTENT[locale],
    project: PROJECT_CONTENT[locale],
  };
}

export type LandingContent = ReturnType<typeof getContent>;
