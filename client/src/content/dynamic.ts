import "server-only";
import { cache } from "react";
import { fetchPublicBlogs, fetchPublicLanding, fetchPublicProjects } from "@/lib/api/public";
import type { HomeContent } from "./home";
import { getContent, type LandingContent, type Locale } from "./index";

type Tree = Record<string, unknown>;
const isObject = (v: unknown): v is Tree => typeof v === "object" && v !== null && !Array.isArray(v);

/** Gộp sâu: giá trị từ CMS ghi đè mặc định; khóa thiếu / rỗng giữ mặc định (landing không bao giờ thiếu chữ). */
function deepMerge<T>(base: T, override: unknown): T {
  if (!isObject(base) || !isObject(override)) return (override === undefined || override === null || override === "" ? base : override) as T;
  const out: Tree = { ...base };
  for (const [key, value] of Object.entries(override)) out[key] = deepMerge((base as Tree)[key], value);
  return out as T;
}

/** Mảng từ CMS chỉ dùng khi hợp lệ và không rỗng */
const list = <T,>(value: unknown, fallback: T[]): T[] => (Array.isArray(value) && value.length ? (value as T[]) : fallback);

/**
 * Nội dung landing cho server component: mặc định trong src/content + dữ liệu động từ admin
 * (CMS trang chủ, dự án, bài viết). Mọi request API được cache theo tag và làm mới ngay khi admin lưu
 * (on-demand revalidation qua /api/revalidate), nên người xem luôn nhận HTML tĩnh, không có màn hình chờ.
 * `cache` để layout + page + metadata trong cùng request chỉ gọi API một lần.
 */
export const getContentDynamic = cache(async (locale: Locale): Promise<LandingContent> => {
  const base = getContent(locale);
  const [projects, blogs, cms] = await Promise.all([fetchPublicProjects(locale), fetchPublicBlogs(locale), fetchPublicLanding(locale)]);
  const c = cms ?? {};
  const home: HomeContent = {
    ...base.home,
    hero: deepMerge(base.home.hero, c.hero),
    stats: list(c.stats, base.home.stats),
    experiences: list(c.experiences, base.home.experiences),
    education: list(c.education, base.home.education),
    skills: list(c.skills, base.home.skills),
    testimonials: list(c.testimonials, base.home.testimonials),
    contact: deepMerge(base.home.contact, c.contact),
    ui: deepMerge(base.home.ui, c.ui),
  };
  return {
    ...base,
    shared: { ...base.shared, meta: deepMerge(base.shared.meta, c.seo) },
    home,
    project: { ...base.project, items: projects ?? base.project.items },
    blog: { ...base.blog, posts: blogs ?? base.blog.posts },
  };
});
