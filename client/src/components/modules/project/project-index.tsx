import dynamic from "next/dynamic";
export * from "./types";

const ProjectSectionGrid = dynamic(() => import("./components/project-section-grid").then((mod) => mod.ProjectSectionGrid));

export function ProjectModulePage() {
	return (
		<div className="text-white pb-32">
			<ProjectSectionGrid />
		</div>
	);
}
