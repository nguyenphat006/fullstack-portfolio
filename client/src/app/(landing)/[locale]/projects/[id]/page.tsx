import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PROJECTS_DATA } from "@/config/projects";
import { siteConfig } from "@/config/site";
import { ProjectDetailContent } from "@/components/modules/project/components/details/project-detail-content";
import { JsonLd } from "@/components/modules/blog/json-ld";
import { getContent } from "@/content";
import { isLocale, localizePath, OG_LOCALE, LOCALES } from "@/content/locales";

type Props = { params: Promise<{ locale: string; id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => PROJECTS_DATA.map((p) => ({ locale, id: p.id })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  if (!isLocale(locale)) return {};
  const { project, shared } = getContent(locale);
  const item = project.items.find((p) => p.id === id);
  if (!item) return {};
  const url = localizePath(locale, `/projects/${id}`);

  return {
    title: item.title,
    description: item.summary,
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(LOCALES.map((l) => [l, localizePath(l, `/projects/${id}`)])),
        "x-default": localizePath("vi", `/projects/${id}`),
      },
    },
    openGraph: {
      type: "website",
      locale: OG_LOCALE[locale],
      url,
      title: item.title,
      description: item.summary,
      siteName: shared.meta.siteName,
      images: [{ url: item.image, alt: item.title }],
    },
    twitter: { card: "summary_large_image", title: item.title, description: item.summary, images: [item.image] },
  };
}

export default async function ProjectDetail({ params }: Props) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();
  const { project, shared } = getContent(locale);
  const item = project.items.find((p) => p.id === id);
  if (!item) notFound();

  const origin = siteConfig.url;
  const url = `${origin}${localizePath(locale, `/projects/${id}`)}`;

  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            name: item.title,
            description: item.summary,
            image: `${origin}${item.image}`,
            inLanguage: locale,
            url,
            keywords: item.stack.join(", "),
            author: { "@type": "Person", name: shared.meta.siteName, url: origin },
            ...(item.liveUrl && { sameAs: [item.liveUrl, ...(item.githubUrl ? [item.githubUrl] : [])] }),
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: shared.ui.home, item: `${origin}${localizePath(locale, "/")}` },
              {
                "@type": "ListItem",
                position: 2,
                name: shared.ui.breadcrumb.projects,
                item: `${origin}${localizePath(locale, "/projects")}`,
              },
              { "@type": "ListItem", position: 3, name: item.title, item: url },
            ],
          },
        ]}
      />
      <ProjectDetailContent project={item} ui={project.ui} />
    </>
  );
}
