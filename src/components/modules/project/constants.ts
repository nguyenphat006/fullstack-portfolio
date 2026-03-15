import { ExperienceItem, ProjectItem } from "./types";

export const PROJECT_SECTION_DATA: ProjectItem[] = [
	{
		id: "project-1",
		title: "SaaS Analytics Dashboard",
		summary: "Built modular dashboard with role-based access, chart-heavy views, and optimized loading for large datasets.",
		stack: ["Next.js", "TypeScript", "Tailwind", "PostgreSQL"],
		year: "2025",
		href: "#",
	},
	{
		id: "project-2",
		title: "E-commerce Management Platform",
		summary: "Implemented inventory, order, and campaign modules with reusable design tokens and fast search workflows.",
		stack: ["Next.js", "Node.js", "Prisma", "Redis"],
		year: "2024",
		href: "#",
	},
	{
		id: "project-3",
		title: "Content Studio for Marketing Team",
		summary: "Created editorial workflow with drafts, approvals, and publishing automation, focused on usability and speed.",
		stack: ["React", "TypeScript", "GraphQL", "Docker"],
		year: "2024",
		href: "#",
	},
];

export const PROJECT_EXPERIENCE_DATA: ExperienceItem[] = [
	{
		id: "exp-1",
		role: "Frontend Engineer",
		company: "Product Studio X",
		period: "2024 - Present",
		highlights: [
			"Shipped 10+ product features with module-first architecture",
			"Reduced UI inconsistencies by introducing shared design tokens",
			"Improved Lighthouse performance score from 78 to 95",
		],
	},
	{
		id: "exp-2",
		role: "Fullstack Developer",
		company: "SaaS Company Y",
		period: "2022 - 2024",
		highlights: [
			"Built internal CRM workflows used by sales and support teams",
			"Implemented reusable UI component patterns with shadcn/ui",
			"Collaborated with designers to improve conversion on onboarding flow",
		],
	},
];
