import dynamic from "next/dynamic";
export * from "./types";

const ProjectSectionGrid = dynamic(() => import("./components/project-section-grid").then((mod) => mod.ProjectSectionGrid));

export function ProjectModulePage({ title }: { title: string }) {
	return (
		<div className="text-foreground pb-32">
			<h1 className="sr-only">{title}</h1>
			<ProjectSectionGrid />
		</div>
	);
}
