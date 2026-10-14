import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { BlogEditorView } from "@/modules/content/blogs/BlogEditorView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("blogs");
  return { title: t("form.createTitle") };
}

export default function NewBlogPage() {
  return <BlogEditorView />;
}
