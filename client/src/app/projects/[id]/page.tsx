import { PROJECTS_DATA } from "@/config/projects";
import { notFound } from "next/navigation";
import { ProjectDetailContent } from "@/components/modules/project/components/details/project-detail-content";

export default async function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = PROJECTS_DATA.find((p) => p.id === id);

  if (!project) notFound();

  return <ProjectDetailContent project={project} />;
}
