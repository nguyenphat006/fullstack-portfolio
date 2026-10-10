import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BLOG_POSTS } from "@/config/blogs";
import { siteConfig } from "@/config/site";
import { BlogDetailContent } from "@/components/modules/blog/components/details/blog-detail-content";
import { JsonLd } from "@/components/modules/blog/json-ld";
import { getContent } from "@/content";
import { isLocale, localizePath, OG_LOCALE, LOCALES } from "@/content/locales";

type Props = { params: Promise<{ locale: string; slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => BLOG_POSTS.map((p) => ({ locale, slug: p.slug })));
}

/** Ngày hiển thị gốc (vi) có dạng dd/mm/yyyy -> ISO yyyy-mm-dd; không đọc được thì bỏ qua. */
function toIsoDate(id: string): string | undefined {
  const raw = BLOG_POSTS.find((p) => p.id === id)?.date;
  const m = raw?.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : undefined;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const post = getContent(locale).blog.posts.find((p) => p.slug === slug);
  if (!post) return {};
  const url = localizePath(locale, `/blog/${slug}`);
  const published = toIsoDate(post.id);

  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(LOCALES.map((l) => [l, localizePath(l, `/blog/${slug}`)])),
        "x-default": localizePath("vi", `/blog/${slug}`),
      },
    },
    openGraph: {
      type: "article",
      locale: OG_LOCALE[locale],
      url,
      title: post.title,
      description: post.excerpt,
      siteName: getContent(locale).shared.meta.siteName,
      images: [{ url: post.image, alt: post.title }],
      ...(published && { publishedTime: published }),
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.excerpt, images: [post.image] },
  };
}

export default async function BlogDetail({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const { blog, shared } = getContent(locale);
  const post = blog.posts.find((p) => p.slug === slug);
  if (!post) notFound();

  const origin = siteConfig.url;
  const url = `${origin}${localizePath(locale, `/blog/${slug}`)}`;
  const published = toIsoDate(post.id);

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
