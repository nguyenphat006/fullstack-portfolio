// —— Hero ——
export interface HomeHeroCta {
	label: string;
	href: string;
}

export interface HomeHeroContent {
	badge: string;
	headline: string;
	subtext: string;
	primaryCta: HomeHeroCta;
	secondaryCta: HomeHeroCta;
}

export interface HomeHeroStat {
	id: string;
	label: string;
	value: string;
	iconName: "CodeCircleIcon" | "Briefcase07Icon" | "BookOpen01Icon";
}

// —— Navbar ——
export interface HomeNavLink {
	id: string;
	label: string;
	href: string;
}

export interface HomeExperienceProjectLink {
	name: string;
	url: string;
	logo?: string;
}

// —— Experience ——
export interface HomeExperienceItem {
	id: string;
	company: string;
	role: string;
	period: string;
	location: string;
	logo: string;
	description?: string;
	websiteUrl?: string;
	details?: {
		category: string;
		items: string[];
	}[];
	projectLinks?: HomeExperienceProjectLink[];
}

// —— Education ——
export interface HomeEducationItem {
	id: string;
	school: string;
	degree: string;
	period: string;
	location: string;
	logo: string;
}

// —— Skills ——
export interface HomeSkillItem {
	id: string;
	name: string;
	logo: string;
}

// —— Projects ——
export interface HomeFeaturedProject {
	id: string;
	title: string;
	summary: string;
	stack: string[];
	period: string;
	thumbnail: string;
	liveUrl: string;
	sourceUrl?: string;
	badges?: string[];
	featured?: boolean;
}

// —— Testimonials ——
export interface HomeTestimonial {
	id: string;
	name: string;
	role: string;
	company: string;
	content: string;
	avatar: string;
}

// —— Contact ——
export interface HomeSocialLink {
	id: string;
	label: string;
	href: string;
	iconName: string;
}

export interface HomeContactContent {
	badge: string;
	headline: string;
	subtext: string;
	primaryCta: HomeHeroCta;
	secondaryCta: HomeHeroCta;
	socials: HomeSocialLink[];
	email: string;
}
