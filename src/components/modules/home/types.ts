// ── Hero ──
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

// ── Navbar ──
export interface HomeNavLink {
	id: string;
	label: string;
	href: string;
}

// ── Featured Projects ──
export interface HomeFeaturedProject {
	id: string;
	title: string;
	summary: string;
	stack: string[];
	year: string;
	href: string;
	featured?: boolean;
}

// ── Tech Stack ──
export interface HomeTechItem {
	name: string;
	level: number; // 1-5
}

export interface HomeTechCategory {
	id: string;
	title: string;
	iconName: string;
	items: HomeTechItem[];
}

// ── About ──
export interface HomeAboutContent {
	badge: string;
	title: string;
	bio: string[];
	values: string[];
	terminalLines: string[];
	ctaLabel: string;
	ctaHref: string;
}

// ── Testimonials ──
export interface HomeTestimonial {
	id: string;
	quote: string;
	name: string;
	role: string;
	company: string;
}

// ── Blog Preview ──
export interface HomeBlogPost {
	id: string;
	title: string;
	excerpt: string;
	category: string;
	readTime: string;
	publishedAt: string;
	href: string;
}

// ── Contact ──
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
