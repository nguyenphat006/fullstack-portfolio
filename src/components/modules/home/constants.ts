import type {
	HomeHeroContent,
	HomeHeroStat,
	HomeNavLink,
	HomeExperienceItem,
	HomeEducationItem,
	HomeSkillItem,
	HomeFeaturedProject,
	HomeBlogPost,
	HomeContactContent,
} from "./types";

// —— Navigation ——
export const HOME_NAV_LINKS: HomeNavLink[] = [
	{ id: "trang-chu", label: "Trang chủ", href: "#trang-chu" },
	{ id: "kinh-nghiem", label: "Kinh nghiệm", href: "#kinh-nghiem" },
	{ id: "hoc-van", label: "Học vấn", href: "#hoc-van" },
	{ id: "ky-nang", label: "Kỹ năng", href: "#ky-nang" },
	{ id: "du-an", label: "Dự án", href: "#du-an" },
	{ id: "bai-viet", label: "Bài viết", href: "#bai-viet" },
];

// —— Hero ——
export const HOME_HERO_CONTENT: HomeHeroContent = {
	badge: "Portfolio Lập Trình Viên",
	headline: "Xây Dựng Trải Nghiệm Web Nhanh, Hiện Đại & Bền Vững",
	subtext:
		"Tôi thiết kế và phát triển sản phẩm số với Next.js, TypeScript và kiến trúc design-system-first. Khám phá các dự án, quy trình kỹ thuật và bài viết chuyên sâu của tôi.",
	primaryCta: {
		label: "Xem Dự Án",
		href: "#du-an",
	},
	secondaryCta: {
		label: "Đọc Blog",
		href: "#bai-viet",
	},
};

export const HOME_HERO_STATS: HomeHeroStat[] = [
	{
		id: "projects",
		label: "Dự Án Đã Hoàn Thành",
		value: "24+",
		iconName: "CodeCircleIcon",
	},
	{
		id: "experience",
		label: "Năm Kinh Nghiệm",
		value: "2+",
		iconName: "Briefcase07Icon",
	},
	{
		id: "articles",
		label: "Bài Viết Kỹ Thuật",
		value: "36",
		iconName: "BookOpen01Icon",
	},
];

// —— Work Experience ——
export const HOME_EXPERIENCES: HomeExperienceItem[] = [
	{
		id: "exp-1",
		company: "Nova Studio",
		role: "Frontend Engineer",
		period: "2024 — Present",
		location: "Ho Chi Minh, VN",
		logo: "/images/logos/company-nova.svg",
	},
	{
		id: "exp-2",
		company: "Atlas Labs",
		role: "UI Engineer",
		period: "2022 — 2024",
		location: "Remote",
		logo: "/images/logos/company-atlas.svg",
	},
	{
		id: "exp-3",
		company: "Kite Digital",
		role: "Web Developer",
		period: "2021 — 2022",
		location: "Da Nang, VN",
		logo: "/images/logos/company-kite.svg",
	},
];

// —— Education ——
export const HOME_EDUCATION: HomeEducationItem[] = [
	{
		id: "edu-1",
		school: "University of Technology",
		degree: "B.Sc. Software Engineering",
		period: "2018 — 2022",
		location: "Ho Chi Minh, VN",
		logo: "/images/logos/edu-utech.svg",
	},
	{
		id: "edu-2",
		school: "Design System Bootcamp",
		degree: "Advanced UI Engineering",
		period: "2023",
		location: "Online",
		logo: "/images/logos/edu-bootcamp.svg",
	},
];

// —— Skills ——
export const HOME_SKILLS: HomeSkillItem[] = [
	{ id: "skill-1", name: "React", logo: "/images/skills/react.svg" },
	{ id: "skill-2", name: "Next.js", logo: "/images/skills/nextjs.svg" },
	{ id: "skill-3", name: "TypeScript", logo: "/images/skills/typescript.svg" },
	{ id: "skill-4", name: "Tailwind", logo: "/images/skills/tailwind.svg" },
	{ id: "skill-5", name: "Node.js", logo: "/images/skills/nodejs.svg" },
	{ id: "skill-6", name: "PostgreSQL", logo: "/images/skills/postgres.svg" },
	{ id: "skill-7", name: "Figma", logo: "/images/skills/figma.svg" },
	{ id: "skill-8", name: "Docker", logo: "/images/skills/docker.svg" },
];

// —— Projects ——
export const HOME_FEATURED_PROJECTS: HomeFeaturedProject[] = [
	{
		id: "project-1",
		title: "SaaS Analytics Dashboard",
		summary:
			"Xây dựng dashboard phân tích với phân quyền, biểu đồ phức tạp và tối ưu tải dữ liệu lớn.",
		stack: ["Next.js", "TypeScript", "Tailwind", "PostgreSQL"],
		period: "2025",
		thumbnail: "/images/projects/project-analytics.svg",
		liveUrl: "https://example.com",
		sourceUrl: "https://github.com/nguyenphat006",
		badges: ["Live", "Source"],
		featured: true,
	},
	{
		id: "project-2",
		title: "E-commerce Management Platform",
		summary:
			"Triển khai quản lý kho, đơn hàng và chiến dịch marketing với design tokens tái sử dụng.",
		stack: ["Next.js", "Node.js", "Prisma", "Redis"],
		period: "2024",
		thumbnail: "/images/projects/project-commerce.svg",
		liveUrl: "https://example.com",
		badges: ["Live"],
	},
	{
		id: "project-3",
		title: "Content Studio cho Marketing",
		summary:
			"Hệ thống biên tập nội dung với quy trình duyệt bài, xuất bản tự động, tập trung UX và tốc độ.",
		stack: ["React", "TypeScript", "GraphQL", "Docker"],
		period: "2024",
		thumbnail: "/images/projects/project-content.svg",
		liveUrl: "https://example.com",
		sourceUrl: "https://github.com/nguyenphat006",
		badges: ["Live", "Source"],
	},
];

// —— Blog Preview ——
export const HOME_BLOG_POSTS: HomeBlogPost[] = [
	{
		id: "blog-1",
		title: "Kiến Trúc Frontend Mở Rộng Với Feature Modules",
		excerpt:
			"Cấu trúc thực tế giúp ứng dụng Next.js lớn dễ bảo trì với ranh giới module rõ ràng.",
		category: "Kiến trúc",
		readTime: "7 phút đọc",
		publishedAt: "Tháng 3, 2026",
		href: "/blog",
		thumbnail: "/images/blog/blog-architecture.svg",
	},
	{
		id: "blog-2",
		title: "Design Tokens Trong Tailwind v4 Cho Bảo Trì Dài Hạn",
		excerpt:
			"Cách kết hợp CSS variables và utility classes để team có thể mở rộng quyết định thiết kế an toàn.",
		category: "Design System",
		readTime: "6 phút đọc",
		publishedAt: "Tháng 2, 2026",
		href: "/blog",
		thumbnail: "/images/blog/blog-tokens.svg",
	},
	{
		id: "blog-3",
		title: "Cải Thiện Web Performance Mà Không Mất UX",
		excerpt:
			"Quy trình checklist giúp cải thiện Core Web Vitals mà vẫn giữ chất lượng visual và tương tác.",
		category: "Hiệu năng",
		readTime: "8 phút đọc",
		publishedAt: "Tháng 1, 2026",
		href: "/blog",
		thumbnail: "/images/blog/blog-performance.svg",
	},
];

// —— Contact ——
export const HOME_CONTACT_CONTENT: HomeContactContent = {
	badge: "Liên Hệ",
	headline: "Cùng Xây Dựng Điều Tuyệt Vời",
	subtext:
		"Bạn có dự án thú vị hoặc cơ hội hợp tác? Tôi luôn sẵn sàng lắng nghe và kết nối.",
	primaryCta: {
		label: "Gửi Email",
		href: "mailto:nguyenphat0406@gmail.com",
	},
	secondaryCta: {
		label: "Xem CV",
		href: "#",
	},
	socials: [
		{
			id: "github",
			label: "GitHub",
			href: "https://github.com/nguyenphat006",
			iconName: "GithubIcon",
		},
		{
			id: "linkedin",
			label: "LinkedIn",
			href: "https://linkedin.com",
			iconName: "Linkedin01Icon",
		},
		{
			id: "email",
			label: "Email",
			href: "mailto:nguyenphat0406@gmail.com",
			iconName: "Mail01Icon",
		},
	],
	email: "nguyenphat0406@gmail.com",
};
