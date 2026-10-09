import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import BlogsView from "@/modules/content/blogs";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("blogs");
  return { title: t("pageTitle") };
}

export default function BlogsPage() {
  return <BlogsView />;
}
