import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { BlogEditorView } from "@/modules/content/blogs/BlogEditorView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("blogs");
  return { title: t("pageTitle") };
}

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  return <BlogEditorView id={id} />;
}
