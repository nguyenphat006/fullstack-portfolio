import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogIndex } from "@/components/modules/blog/blog-index";
import { JsonLd } from "@/components/modules/blog/json-ld";
import { siteConfig } from "@/config/site";
import { getContent } from "@/content";
import { isLocale, localizePath, OG_LOCALE, LOCALES } from "@/content/locales";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { shared } = getContent(locale);
  const { title, description } = shared.meta.pages.blog;
  const url = localizePath(locale, "/blog");

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(LOCALES.map((l) => [l, localizePath(l, "/blog")])),
        "x-default": localizePath("vi", "/blog"),
      },
    },
    openGraph: { type: "website", locale: OG_LOCALE[locale], url, title, description, siteName: shared.meta.siteName },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { shared, blog } = getContent(locale);
  const { title, description } = shared.meta.pages.blog;
  const origin = siteConfig.url;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: title,
          description,
          inLanguage: locale,
          url: `${origin}${localizePath(locale, "/blog")}`,
          mainEntity: {
            "@type": "ItemList",
            itemListElement: blog.posts.map((post, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: post.title,
              url: `${origin}${localizePath(locale, `/blog/${post.slug}`)}`,
            })),
          },
        }}
      />
      <BlogIndex />
    </>
  );
}
