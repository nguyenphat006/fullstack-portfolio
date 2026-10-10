import type { MetadataRoute } from "next";
import { absoluteUrl, languageAlternates, siteConfig } from "@/config/site";
import { DEFAULT_LOCALE, getContent, LOCALES, type Locale } from "@/content";

/** Sitemap đa ngôn ngữ: mỗi URL kèm hreflang (vi / en / x-default). */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = getContent(DEFAULT_LOCALE);
  const paths: { path: string; priority: number; changeFrequency: "weekly" | "monthly"; lastModified?: string }[] = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    { path: "/projects", priority: 0.8, changeFrequency: "weekly" },
    { path: "/blog", priority: 0.8, changeFrequency: "weekly" },
    ...base.project.items.map((p) => ({ path: `/projects/${p.id}`, priority: 0.7, changeFrequency: "monthly" as const })),
    ...base.blog.posts.map((p) => ({ path: `/blog/${p.slug}`, priority: 0.6, changeFrequency: "monthly" as const })),
  ];

  const alternatesFor = (path: string) => {
    const langs = languageAlternates(path);
    return Object.fromEntries(Object.entries(langs).map(([k, v]) => [k, new URL(v, siteConfig.url).toString()]));
  };

  return LOCALES.flatMap((locale: Locale) =>
    paths.map(({ path, priority, changeFrequency }) => ({
      url: absoluteUrl(locale, path),
      lastModified: new Date(),
      changeFrequency,
      priority,
      alternates: { languages: alternatesFor(path) },
    })),
  );
}
