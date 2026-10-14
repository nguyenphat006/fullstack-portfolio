import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ProjectEditorView } from "@/modules/content/projects/ProjectEditorView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("projects");
  return { title: t("form.createTitle") };
}

export default function NewProjectPage() {
  return <ProjectEditorView />;
}
