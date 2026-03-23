import type {
	HomeHeroContent,
	HomeHeroStat,
	HomeNavLink,
	HomeExperienceItem,
	HomeEducationItem,
	HomeSkillItem,
	HomeFeaturedProject,
	HomeTestimonial,
	HomeContactContent,
} from "./types";

// —— Navigation ——
export const HOME_NAV_LINKS: HomeNavLink[] = [
	{ id: "trang-chu", label: "Trang chủ", href: "#trang-chu" },
	{ id: "kinh-nghiem", label: "Kinh nghiệm", href: "#kinh-nghiem" },
	{ id: "hoc-van", label: "Học vấn", href: "#hoc-van" },
	{ id: "ky-nang", label: "Kỹ năng", href: "#ky-nang" },
	{ id: "du-an", label: "Dự án", href: "#du-an" },
	{ id: "nhan-xet", label: "Nhận xét", href: "#nhan-xet" },
];

// —— Hero ——
export const HOME_HERO_CONTENT: HomeHeroContent = {
	badge: "Lập trình viên Fullstack",
	headline: "Xin chào, tôi là ERICSS.",
	subtext:
		"Tên thật của tôi là Nguyễn Đăng Phát. Tôi là một Fullstack Developer đam mê việc biến ý tưởng thành các sản phẩm công nghệ hoàn thiện. Tập trung vào Next.js, TypeScript và kiến trúc hệ thống bền vững.",
	primaryCta: {
		label: "Xem Dự Án",
		href: "#du-an",
	},
	secondaryCta: {
		label: "Người Khác Nói Gì?",
		href: "#nhan-xet",
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
		company: "NPH DIGITAL",
		role: "Team Leader / Frontend Developer (REMOTE)",
		period: "11/2024 — Hiện tại",
		location: "Đồng Nai, VN",
		logo: "/images/work-experience/nph-01.png",
		websiteUrl: "https://nphdigital.com",
		description: "Xây dựng kiến trúc hệ thống frontend, phát triển ứng dụng web phức tạp và dẫn dắt đội ngũ kỹ thuật.",
		details: [
			{
				category: "Kiến trúc Code & Kỹ thuật",
				items: [
					"Xây dựng và thiết kế theo hướng Module Components, tách biệt hoàn toàn các tầng UI, Service, Types.",
					"Thiết lập API Layer chuẩn hóa bằng Axios & TypeScript.",
					"Xây dựng thư viện Shared Components dùng chung cho các dự án (OCCO, Chatbot)."
				]
			},
			{
				category: "Vận hành & Triển khai",
				items: [
					"Trực tiếp cấu hình và quản trị hệ thống trên VPS, thiết lập Nginx, MySQL.",
					"Xây dựng luồng CI/CD đảm bảo quy trình deployment tự động, ổn định."
				]
			},
			{
				category: "Quản lý & Điều phối",
				items: [
					"Dẫn dắt đội ngũ Frontend, phân chia công việc, định hướng luồng nghiệp vụ xử lý cho các thành viên.",
					"Đảm bảo chất lượng đầu ra về UI/UX lẫn hiệu năng."
				]
			}
		],
		projectLinks: [
			{ name: "NPH Digital", url: "https://nphdigital.com", logo: "/images/work-experience/nph-01.png" },
			{ name: "Occo", url: "https://occo.vn/" },
			{ name: "Buzuai", url: "https://buzuai.com/" },
			{ name: "Artjob", url: "https://artjob.vn/" },
			{ name: "Piano", url: "https://pianocaocap.vn/" }
		]
	},
	{
		id: "exp-2",
		company: "HINOVA TECHNOLOGY JSC",
		role: "Thực tập sinh .NET Developer Fullstack",
		period: "03/2024 — 10/2024",
		location: "Đồng Nai, VN",
		logo: "/images/work-experience/hinova.png",
		websiteUrl: "https://hinova.vn",
		description: "Phát triển Backend API với ASP.NET Core & giao diện Frontend cho các hệ thống phần mềm doanh nghiệp và trường học.",
		details: [
			{
				category: "Phát triển Backend & API",
				items: [
					"Thiết kế và triển khai hệ thống API theo hướng Module-based trên nền tảng ASP.NET Core 8."
				]
			},
			{
				category: "Tối ưu hóa UI/UX",
				items: [
					"Xây dựng giao diện hiện đại bằng HTML5, CSS3 và KendoUI.",
					"Tập trung cải thiện tính tương thích (Responsive Design) và trải nghiệm người dùng."
				]
			},
			{
				category: "Triển khai & Vận hành",
				items: [
					"Trực tiếp phối hợp với khách hàng tại trường học để trao đổi và bàn giao sản phẩm."
				]
			}
		],
		projectLinks: [
			{ name: "Đại học Bạc Liêu", url: "https://blu.edu.vn/", logo: "/images/work-experience/blu.png" },
			{ name: "Thư viện điện tử", url: "https://lib.blu.edu.vn/", logo: "/images/work-experience/blu.png" }
		]
	},
	{
		id: "exp-3",
		company: "IOT Software VN",
		role: "Frontend Developer (Freelance)",
		period: "11/2025 — 03/2026",
		location: "Đồng Nai, VN",
		logo: "/images/work-experience/iotsoft.jpg",
		websiteUrl: "https://lhbs-edu-vn.devdotnet.id.vn/",
		description: "Trực tiếp xây dựng nền tảng Website Landing Page đa tên miền cho Hệ thống Trường Song ngữ Lạc Hồng.",
		details: [
			{
				category: "Phân tích và Thiết kế",
				items: [
					"Xây dựng Design System và Brand Guide để đảm bảo tính nhất quán thương hiệu cho trường.",
					"Chủ động trao đổi, thống nhất khung giao diện (Wireframe) với khách hàng qua từng giai đoạn."
				]
			},
			{
				category: "Kiến trúc Monorepo",
				items: [
					"Sử dụng Turborepo để quản lý 4 tên miền (domain) khác nhau trong cùng một cấu trúc mã nguồn.",
					"Tái sử dụng triệt để các thư viện component dùng chung, giúp tiết kiệm 50% thời gian phát triển và đồng bộ hóa logic."
				]
			},
			{
				category: "Hiệu năng & SEO",
				items: [
					"Tập trung xử lý hiệu năng tải trang và tối ưu các chỉ số SEO cho các trang Landing Page.",
					"Đảm bảo cấu trúc code sạch, dễ lập chỉ mục nhằm tăng khả năng tiếp cận khách hàng."
				]
			}
		],
		projectLinks: [
			{ name: "Song Ngữ Lạc Hồng", url: "https://lhbs-edu-vn.devdotnet.id.vn/", logo: "/images/projects/project-content.svg" }
		]
	}
];

// —— Education ——
export const HOME_EDUCATION: HomeEducationItem[] = [
	{
		id: "edu-1",
		school: "Đại học Lạc Hồng",
		degree: "Công nghệ Thông tin",
		period: "2026 — Hiện tại",
		location: "Đồng Nai, VN",
		logo: "https://cdn.haitrieu.com/wp-content/uploads/2021/12/Logo-DH-Lac-Hong-LHU-VN.png",
	},
	{
		id: "edu-2",
		school: "FPT Polytechnic",
		degree: "Phát triển Phần mềm .NET",
		period: "GPA: 3.95/4.0",
		location: "Đồng Nai, VN",
		logo: "https://upload.wikimedia.org/wikipedia/commons/2/20/FPT_Polytechnic.png",
	},
	{
		id: "edu-3",
		school: "IIG Việt Nam",
		degree: "Chứng chỉ Tiếng Anh TOEIC 650+",
		period: "Năm 2025",
		location: "TP.HCM, VN",
		logo: "https://static.wikia.nocookie.net/logos/images/f/f1/IIG_logo.png/revision/latest/scale-to-width-down/668?cb=20250820035209&path-prefix=vi",
	},
	{
		id: "edu-4",
		school: "Google / Coursera",
		degree: "Chuyên viên thiết kế UI/UX (Professional Certificate)",
		period: "Năm 2024",
		location: "Online Training",
		logo: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_\"G\"_logo.svg",
	},
	{
		id: "edu-5",
		school: "THCS Lê Quang Định",
		degree: "Bằng Tốt nghiệp Trung học Cơ sở",
		period: "2016 — 2020",
		location: "Đồng Nai, VN",
		logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROp8LcxtKMeMuSH5KbjDtoLP2UUkbmFyOs5w&s",
	}
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
		title: "ShopSifu E-commerce Platform",
		summary:
			"Nền tảng thương mại điện tử đa luồng (Client, Admin, Seller) tích hợp quản lý phân quyền (RBAC), thanh toán (VNPay, Sepay) và Socket.IO.",
		stack: ["Next.js", "NestJS", "Redux", "Prisma", "PostgreSQL", "Redis"],
		period: "05/2025 - 08/2025",
		thumbnail: "/images/projects/shopsifu.png",
		liveUrl: "https://shopsifu.live/",
		badges: ["Live"],
		featured: true,
	},
	{
		id: "project-2",
		title: "Song Ngữ Lạc Hồng",
		summary:
			"Hệ thống đa tên miền trường học sử dụng kiến trúc Turborepo giúp chia sẻ UI Components (ShadCN). Tối ưu SEO và Responsive hoàn chỉnh.",
		stack: ["Turborepo", "React", "TailwindCSS", "Framer Motion"],
		period: "11/2025 - 03/2026",
		thumbnail: "/images/projects/lhs.png",
		liveUrl: "https://lhbs-edu-vn.devdotnet.id.vn/",
		badges: ["Live"],
	}
];

// —— Testimonials ——
export const HOME_TESTIMONIALS: HomeTestimonial[] = [
	{
		id: "testi-1",
		name: "Anh Hoàng Nguyễn",
		role: "Founder & CEO",
		company: "NPH DIGITAL",
		content: "Chuyên môn ổn định, trách nhiệm cao. Có tư duy hệ thống tốt, luôn chủ động đưa ra giải pháp và dẫn dắt đội ngũ hiệu quả.",
		avatar: "/images/work-experience/nph-01.png",
	},
	{
		id: "testi-2",
		name: "Chị Minh Thư",
		role: "Project Manager",
		company: "HINOVA TECHNOLOGY",
		content: "Nắm bắt logic nghiệp vụ phần mềm doanh nghiệp nhanh nhạy, code cẩn thận. Giao diện chỉn chu, tối ưu UX, luôn hoàn thành xuất sắc các tính năng cốt lõi.",
		avatar: "/images/work-experience/hinova.png",
	},
	{
		id: "testi-3",
		name: "Anh Tuấn Phan",
		role: "Tech Lead",
		company: "IOT Software VN",
		content: "Tư duy kiến trúc component xuất sắc. Áp dụng thành thạo Turborepo và ShadCN giúp tiết kiệm 50% thời gian phát triển hệ thống Landing Page của trường.",
		avatar: "/images/work-experience/iotsoft.jpg",
	},
	{
		id: "testi-4",
		name: "Thầy Chương",
		role: "Giảng viên",
		company: "FPT Polytechnic",
		content: "Sinh viên có tư duy lập trình vững vàng, thái độ học tập nghiêm túc và luôn đạt kết quả xuất sắc trong các dự án thực tế.",
		avatar: "https://upload.wikimedia.org/wikipedia/commons/2/20/FPT_Polytechnic.png",
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
		href: "https://rxresu.me/nguyenphat006/cv-nguyen-dang-phat-vietnamese-fe",
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
			href: "https://www.linkedin.com/in/ericss-ndp/",
			iconName: "Linkedin01Icon",
		},
		{
			id: "email",
			label: "Email",
			href: "mailto:nguyenphat1505@gmail.com",
			iconName: "Mail01Icon",
		},
	],
	email: "nguyenphat1505@gmail.com",
};
