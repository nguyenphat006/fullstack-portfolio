import dynamic from "next/dynamic";
import { HomeNavbar } from "./components/home-navbar";
import { HomeHeroSection } from "./components/hero-section";
export * from "./types";

const HomeExperienceSection = dynamic(() => import("./components/experience-section").then((mod) => mod.HomeExperienceSection));
const HomeSkillsSection = dynamic(() => import("./components/skill-section").then((mod) => mod.HomeSkillsSection));
const HomeFeaturedProjects = dynamic(() => import("./components/project-section").then((mod) => mod.HomeFeaturedProjects));
const HomeTestimonialsSection = dynamic(() => import("./components/testimonial-section").then((mod) => mod.HomeTestimonialsSection));

export function HomeModulePage() {
	return (
		<div className="text-white">
			<HomeNavbar />
			<HomeHeroSection />
			<div className="ds-divider" />
			<HomeExperienceSection />
			<div className="ds-divider" />
			<HomeSkillsSection />
			<div className="ds-divider" />
			<HomeFeaturedProjects />
			<div className="ds-divider" />
			<HomeTestimonialsSection />
		</div>
	);
}
