import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site";
import { BlogDetailContent } from "@/components/modules/blog/components/details/blog-detail-content";
import { JsonLd } from "@/components/modules/blog/json-ld";
import { getContentDynamic } from "@/content/dynamic";
import { isLocale, localizePath, OG_LOCALE, LOCALES, DEFAULT_LOCALE } from "@/content/locales";

type Props = { params: Promise<{ locale: string; slug: string }> };

// Bài viết mới thêm trong admin chưa có trang tĩnh lúc build -> dựng theo yêu cầu rồi cache (ISR); slug không tồn tại -> 404
export const dynamicParams = true;
export const revalidate = 300;

export async function generateStaticParams() {
  const perLocale = await Promise.all(LOCALES.map(async (locale) => ({ locale, posts: (await getContentDynamic(locale)).blog.posts })));
  return perLocale.flatMap(({ locale, posts }) => posts.map((p) => ({ locale, slug: p.slug })));
}

/** Ngày hiển thị (dd/mm/yyyy hoặc dạng tiếng Anh như "Mar 10, 2026") -> ISO yyyy-mm-dd; không đọc được thì bỏ qua. */
function toIsoDate(raw: string): string | undefined {
  const m = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  const parsed = new Date(`${raw} 12:00 UTC`);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString().slice(0, 10);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const content = await getContentDynamic(locale);
  const post = content.blog.posts.find((p) => p.slug === slug);
  if (!post) return {};
  const url = localizePath(locale, `/blog/${slug}`);
  const published = toIsoDate(post.date);

  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(LOCALES.map((l) => [l, localizePath(l, `/blog/${slug}`)])),
        "x-default": localizePath(DEFAULT_LOCALE, `/blog/${slug}`),
      },
    },
    openGraph: {
      type: "article",
      locale: OG_LOCALE[locale],
      url,
      title: post.title,
      description: post.excerpt,
      siteName: content.shared.meta.siteName,
      images: [{ url: post.image, alt: post.title }],
      ...(published && { publishedTime: published }),
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.excerpt, images: [post.image] },
  };
}

export default async function BlogDetail({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const { blog, shared } = await getContentDynamic(locale);
  const post = blog.posts.find((p) => p.slug === slug);
  if (!post) notFound();

  const origin = siteConfig.url;
  const url = `${origin}${localizePath(locale, `/blog/${slug}`)}`;
  const published = toIsoDate(post.date);

  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt,
            image: `${origin}${post.image}`,
            inLanguage: locale,
            articleSection: post.category,
            mainEntityOfPage: url,
            url,
            ...(published && { datePublished: published }),
            author: { "@type": "Person", name: shared.meta.siteName, url: origin },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: shared.ui.home, item: `${origin}${localizePath(locale, "/")}` },
              {
                "@type": "ListItem",
                position: 2,
                name: shared.ui.breadcrumb.blog,
                item: `${origin}${localizePath(locale, "/blog")}`,
              },
              { "@type": "ListItem", position: 3, name: post.title, item: url },
            ],
          },
        ]}
      />
      <BlogDetailContent post={post} ui={blog.ui} />
    </>
  );
}
