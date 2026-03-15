import type {
	HomeHeroContent,
	HomeHeroStat,
	HomeNavLink,
	HomeFeaturedProject,
	HomeTechCategory,
	HomeAboutContent,
	HomeTestimonial,
	HomeBlogPost,
	HomeContactContent,
} from "./types";

// ── Navigation ──
export const HOME_NAV_LINKS: HomeNavLink[] = [
	{ id: "home", label: "Trang chủ", href: "#" },
	{ id: "projects", label: "Dự án", href: "#du-an" },
	{ id: "tech", label: "Công nghệ", href: "#cong-nghe" },
	{ id: "about", label: "Về tôi", href: "#ve-toi" },
	{ id: "blog", label: "Bài viết", href: "#bai-viet" },
	{ id: "contact", label: "Liên hệ", href: "#lien-he" },
];

// ── Hero ──
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
		value: "4+",
		iconName: "Briefcase07Icon",
	},
	{
		id: "articles",
		label: "Bài Viết Kỹ Thuật",
		value: "36",
		iconName: "BookOpen01Icon",
	},
];

// ── Featured Projects ──
export const HOME_FEATURED_PROJECTS: HomeFeaturedProject[] = [
	{
		id: "project-1",
		title: "SaaS Analytics Dashboard",
		summary:
			"Xây dựng dashboard phân tích với phân quyền, biểu đồ phức tạp và tối ưu tải dữ liệu lớn.",
		stack: ["Next.js", "TypeScript", "Tailwind", "PostgreSQL"],
		year: "2025",
		href: "/projects",
		featured: true,
	},
	{
		id: "project-2",
		title: "E-commerce Management Platform",
		summary:
			"Triển khai quản lý kho, đơn hàng và chiến dịch marketing với design tokens tái sử dụng.",
		stack: ["Next.js", "Node.js", "Prisma", "Redis"],
		year: "2024",
		href: "/projects",
	},
	{
		id: "project-3",
		title: "Content Studio cho Marketing",
		summary:
			"Hệ thống biên tập nội dung với quy trình duyệt bài, xuất bản tự động, tập trung UX và tốc độ.",
		stack: ["React", "TypeScript", "GraphQL", "Docker"],
		year: "2024",
		href: "/projects",
	},
];

// ── Tech Stack ──
export const HOME_TECH_STACK: HomeTechCategory[] = [
	{
		id: "frontend",
		title: "Frontend",
		iconName: "CodeCircleIcon",
		items: [
			{ name: "React / Next.js", level: 5 },
			{ name: "TypeScript", level: 5 },
			{ name: "Tailwind CSS", level: 5 },
			{ name: "HTML / CSS", level: 5 },
			{ name: "Framer Motion", level: 4 },
		],
	},
	{
		id: "backend",
		title: "Backend",
		iconName: "Briefcase07Icon",
		items: [
			{ name: "Node.js", level: 4 },
			{ name: "PostgreSQL", level: 4 },
			{ name: "Prisma ORM", level: 4 },
			{ name: "REST / GraphQL", level: 4 },
			{ name: "Redis", level: 3 },
		],
	},
	{
		id: "tools",
		title: "Tools & DevOps",
		iconName: "BookOpen01Icon",
		items: [
			{ name: "Git / GitHub", level: 5 },
			{ name: "Docker", level: 4 },
			{ name: "Figma", level: 4 },
			{ name: "Vercel / AWS", level: 4 },
			{ name: "CI/CD", level: 3 },
		],
	},
];

// ── About ──
export const HOME_ABOUT_CONTENT: HomeAboutContent = {
	badge: "Về Tôi",
	title: "Lập Trình Viên Fullstack",
	bio: [
		"Tôi là một lập trình viên fullstack với hơn 4 năm kinh nghiệm trong việc xây dựng các sản phẩm web hiện đại.",
		"Đam mê tạo ra những trải nghiệm số mượt mà, hiệu năng cao và có kiến trúc bền vững.",
	],
	values: [
		"Clean Code — Viết mã sạch, dễ bảo trì",
		"User-First — Thiết kế lấy người dùng làm trung tâm",
		"Performance — Tối ưu hiệu năng ở mọi tầng",
		"Continuous Learning — Không ngừng học hỏi công nghệ mới",
	],
	terminalLines: [
		"$ whoami",
		"> Fullstack Developer @ Vietnam 🇻🇳",
		"$ cat skills.txt",
		"> React, Next.js, TypeScript, Node.js, PostgreSQL",
		"$ cat philosophy.txt",
		"> \"Code chất lượng là nền tảng của sản phẩm tốt.\"",
	],
	ctaLabel: "Tải CV",
	ctaHref: "#",
};

// ── Testimonials ──
export const HOME_TESTIMONIALS: HomeTestimonial[] = [
	{
		id: "testimonial-1",
		quote:
			"Làm việc cực kỳ chuyên nghiệp, code sạch và luôn giao đúng deadline. Một trong những developer tốt nhất tôi từng hợp tác.",
		name: "Nguyễn Văn A",
		role: "Product Manager",
		company: "Tech Company X",
	},
	{
		id: "testimonial-2",
		quote:
			"Khả năng giải quyết vấn đề xuất sắc, luôn đưa ra giải pháp tối ưu và có tư duy kiến trúc rất tốt.",
		name: "Trần Thị B",
		role: "Tech Lead",
		company: "Startup Y",
	},
	{
		id: "testimonial-3",
		quote:
			"Không chỉ code tốt mà còn có mắt thẩm mỹ UI/UX rất tốt. Sản phẩm luôn đẹp và dễ sử dụng.",
		name: "Lê Văn C",
		role: "CTO",
		company: "Digital Agency Z",
	},
];

// ── Blog Preview ──
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
	},
];

// ── Contact ──
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
