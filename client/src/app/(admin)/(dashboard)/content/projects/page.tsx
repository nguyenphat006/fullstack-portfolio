import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ProjectsView from "@/modules/content/projects";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("projects");
  return { title: t("pageTitle") };
}

export default function ProjectsPage() {
  return <ProjectsView />;
}
