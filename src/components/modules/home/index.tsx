import { HomeNavbar } from "./components/home-navbar";
import { HomeHeroSection } from "./components/home-hero-section";
import { HomeFeaturedProjects } from "./components/home-featured-projects";
import { HomeTechStack } from "./components/home-tech-stack";
import { HomeAboutSection } from "./components/home-about-section";
import { HomeTestimonials } from "./components/home-testimonials";
import { HomeBlogPreview } from "./components/home-blog-preview";
import { HomeContactSection } from "./components/home-contact-section";

export function HomeModulePage() {
	return (
		<main className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
			<HomeNavbar />
			<HomeHeroSection />
			<div className="ds-divider" />
			<HomeFeaturedProjects />
			<div className="ds-divider" />
			<HomeTechStack />
			<div className="ds-divider" />
			<HomeAboutSection />
			<div className="ds-divider" />
			<HomeTestimonials />
			<div className="ds-divider" />
			<HomeBlogPreview />
			<div className="ds-divider" />
			<HomeContactSection />
		</main>
	);
}
