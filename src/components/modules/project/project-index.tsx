import { ProjectSectionExperience } from "./components/project-section-experience";
import { ProjectSectionGrid } from "./components/project-section-grid";
export * from "./types";

export function ProjectModulePage() {
	return (
		<main className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
			<ProjectSectionGrid />
			<ProjectSectionExperience />
		</main>
	);
}
