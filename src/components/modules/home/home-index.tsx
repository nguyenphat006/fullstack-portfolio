import dynamic from "next/dynamic";
import { HomeNavbar } from "./components/home-navbar";
import { HomeHeroSection } from "./components/hero-section";
export * from "./types";
import { SharedDock } from "@/components/shared/layout/shared-dock";
import { Preloader } from "@/components/shared/layout/preloader";

import { PageBackground } from "@/components/shared/layout/page-background";

const HomeExperienceSection = dynamic(() => import("./components/experience-section").then((mod) => mod.HomeExperienceSection));
const HomeSkillsSection = dynamic(() => import("./components/home-skills-section").then((mod) => mod.HomeSkillsSection));
const HomeFeaturedProjects = dynamic(() => import("./components/home-featured-projects").then((mod) => mod.HomeFeaturedProjects));
const HomeBlogPreview = dynamic(() => import("./components/home-blog-preview").then((mod) => mod.HomeBlogPreview));

export function HomeModulePage() {
	return (
		<PageBackground className="text-white">
			<Preloader />
			<HomeNavbar />
			<SharedDock />
			<HomeHeroSection />
			<div className="ds-divider" />
			<HomeExperienceSection />
			<div className="ds-divider" />
			<HomeSkillsSection />
			<div className="ds-divider" />
			<HomeFeaturedProjects />
			<div className="ds-divider" />
			<HomeBlogPreview />
		</PageBackground>
	);
}
