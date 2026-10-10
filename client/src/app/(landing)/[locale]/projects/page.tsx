import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectModulePage } from "@/components/modules/project";
import { JsonLd } from "@/components/modules/blog/json-ld";
import { siteConfig } from "@/config/site";
import { getContent } from "@/content";
import { isLocale, localizePath, OG_LOCALE, LOCALES } from "@/content/locales";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { shared } = getContent(locale);
  const { title, description } = shared.meta.pages.projects;
  const url = localizePath(locale, "/projects");

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(LOCALES.map((l) => [l, localizePath(l, "/projects")])),
        "x-default": localizePath("vi", "/projects"),
      },
    },
    openGraph: { type: "website", locale: OG_LOCALE[locale], url, title, description, siteName: shared.meta.siteName },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ProjectsPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { shared, project } = getContent(locale);
  const { title, description } = shared.meta.pages.projects;
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
          url: `${origin}${localizePath(locale, "/projects")}`,
          mainEntity: {
            "@type": "ItemList",
            itemListElement: project.items.map((item, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: item.title,
              url: `${origin}${localizePath(locale, `/projects/${item.id}`)}`,
            })),
          },
        }}
      />
      <ProjectModulePage title={title} />
    </>
  );
}
