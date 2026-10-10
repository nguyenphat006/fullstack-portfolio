import type { Metadata } from "next";
import { DEFAULT_LOCALE, LOCALES, OG_LOCALE, localizePath, type Locale } from "@/content/locales";
import { SHARED_CONTENT } from "@/content/shared";

/** Thông tin cố định của website (chữ theo ngôn ngữ nằm ở src/content/shared). */
export const siteConfig = {
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://dangphat.dev",
  /** Ảnh OG mặc định: sinh động bởi opengraph-image.tsx của từng ngôn ngữ */
  twitterHandle: "@ericss",
  links: {
    github: "https://github.com/nguyenphat006",
    facebook: "https://facebook.com/nphat.dev",
    linkedin: "https://www.linkedin.com/in/ericss-ndp/",
  },
  email: "nguyenphat1505@gmail.com",
};

/** URL tuyệt đối của một đường dẫn (không có tiền tố ngôn ngữ) theo ngôn ngữ. */
export function absoluteUrl(locale: Locale, path = "/"): string {
  return new URL(localizePath(locale, path), siteConfig.url).toString();
}

/** Bản đồ hreflang cho một đường dẫn: vi, en và x-default (= tiếng Việt). */
export function languageAlternates(path = "/"): Record<string, string> {
  const map: Record<string, string> = {};
  for (const l of LOCALES) map[l] = localizePath(l, path);
  map["x-default"] = localizePath(DEFAULT_LOCALE, path);
  return map;
}

interface MetadataInput {
  locale: Locale;
  /** Đường dẫn không tiền tố ngôn ngữ, vd "/blog/ten-bai" */
  path?: string;
  title?: string;
  description?: string;
  /** Ảnh OG (đường dẫn tương đối hoặc URL tuyệt đối). Bỏ trống -> dùng opengraph-image của trang */
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  noIndex?: boolean;
}

/** Metadata SEO đầy đủ cho một trang: title, mô tả, canonical, hreflang, Open Graph, Twitter. */
export function constructMetadata({
  locale, path = "/", title, description, image, type = "website", publishedTime, noIndex = false,
}: MetadataInput): Metadata {
  const { meta } = SHARED_CONTENT[locale];
  const isHome = path === "/";
  const pageTitle = title ?? meta.title;
  const pageDescription = description ?? meta.description;
  const fullTitle = isHome && !title ? meta.title : `${pageTitle} | ${meta.siteName}`;
  const url = absoluteUrl(locale, path);

  return {
    metadataBase: new URL(siteConfig.url),
    // Trang chủ khai báo template để các trang con chỉ cần đặt `title: "Tên trang"`
    title: isHome && !title ? { default: meta.title, template: `%s | ${meta.siteName}` } : { absolute: fullTitle },
    description: pageDescription,
    keywords: meta.keywords,
    authors: [{ name: meta.siteName, url: siteConfig.links.github }],
    creator: meta.siteName,
    alternates: { canonical: localizePath(locale, path), languages: languageAlternates(path) },
    openGraph: {
      type,
      locale: OG_LOCALE[locale],
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
      url,
      title: fullTitle,
      description: pageDescription,
      siteName: meta.siteName,
      ...(type === "article" && publishedTime ? { publishedTime } : {}),
      ...(image ? { images: [{ url: image, width: 1200, height: 630, alt: pageTitle }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: pageDescription,
      creator: siteConfig.twitterHandle,
      ...(image ? { images: [image] } : {}),
    },
    icons: { icon: "/favicon.ico", apple: "/apple-touch-icon.png" },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true, "max-image-preview": "large" },
  };
}

/** Serialize JSON-LD an toàn để nhúng vào <script type="application/ld+json">. */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\u003c");
}
