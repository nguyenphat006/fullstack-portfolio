import dynamic from "next/dynamic";
export * from "./types";

import { PageBackground } from "@/components/shared/layout/page-background";

const ProjectSectionExperience = dynamic(() => import("./components/project-section-experience").then((mod) => mod.ProjectSectionExperience));
const ProjectSectionGrid = dynamic(() => import("./components/project-section-grid").then((mod) => mod.ProjectSectionGrid));

export function ProjectModulePage() {
	return (
		<PageBackground>
			<ProjectSectionGrid />
			<ProjectSectionExperience />
		</PageBackground>
	);
}
