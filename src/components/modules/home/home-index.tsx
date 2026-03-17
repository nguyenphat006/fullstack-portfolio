import { HomeNavbar } from "./components/home-navbar";
import { HomeHeroSection } from "./components/hero-section";
export * from "./types";
import { HomeExperienceSection } from "./components/experience-section";
import { HomeEducationSection } from "./components/home-education-section";
import { HomeSkillsSection } from "./components/home-skills-section";
import { HomeFeaturedProjects } from "./components/home-featured-projects";
import { HomeBlogPreview } from "./components/home-blog-preview";
import { SharedDock } from "@/components/shared/shared-dock";
import { Preloader } from "@/components/shared/preloader";

export function HomeModulePage() {
	return (
		<main className="min-h-screen bg-[var(--color-background)] text-white">
			<Preloader />
			<HomeNavbar />
			<SharedDock />
			<HomeHeroSection />
			<div className="ds-divider" />
			<HomeExperienceSection />
			<div className="ds-divider" />
			<HomeEducationSection />
			<div className="ds-divider" />
			<HomeSkillsSection />
			<div className="ds-divider" />
			<HomeFeaturedProjects />
			<div className="ds-divider" />
			<HomeBlogPreview />
		</main>
	);
}
