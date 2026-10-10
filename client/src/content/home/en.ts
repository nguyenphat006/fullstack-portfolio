import type { HomeContent } from "./types";
import { homeVi } from "./vi";

/** Chỉ ghi lại các trường cần dịch theo id; dữ liệu trung tính (logo, url, icon...) lấy từ bản vi. */
function merge<T extends { id: string }>(items: T[], overrides: Record<string, Partial<T>>): T[] {
  return items.map((item) => ({ ...item, ...overrides[item.id] }));
}

export const homeEn: HomeContent = {
  nav: merge(homeVi.nav, {
    "trang-chu": { label: "Home" },
    "kinh-nghiem": { label: "Experience" },
    "hoc-van": { label: "Education" },
    "ky-nang": { label: "Skills" },
    "du-an": { label: "Projects" },
    "nhan-xet": { label: "Testimonials" },
  }),
  hero: {
    ...homeVi.hero,
    badge: "Fullstack Developer",
    headline: "Hi, I'm ERICSS.",
    subtext:
      "My real name is Nguyen Dang Phat. I'm a Fullstack Developer passionate about turning ideas into polished digital products, with a focus on Next.js, TypeScript and sustainable system architecture.",
    primaryCta: { ...homeVi.hero.primaryCta, label: "View Projects" },
    secondaryCta: { ...homeVi.hero.secondaryCta, label: "What Do Others Say?" },
  },
  stats: merge(homeVi.stats, {
    projects: { label: "Projects Completed" },
    experience: { label: "Years of Experience" },
    articles: { label: "Technical Articles" },
  }),
  experiences: merge(homeVi.experiences, {
    "exp-1": {
      role: "Team Leader / Frontend Developer (REMOTE)",
      period: "11/2024 — Present",
      location: "Dong Nai, VN",
      description:
        "Designing frontend system architecture, building complex web applications and leading the engineering team.",
      details: [
        {
          category: "Code Architecture & Engineering",
          items: [
            "Designed and built a modular component architecture, fully separating the UI, Service and Types layers.",
            "Set up a standardized API layer with Axios & TypeScript.",
            "Built a shared component library reused across projects (OCCO, Chatbot).",
          ],
        },
        {
          category: "Operations & Deployment",
          items: [
            "Personally configured and managed VPS infrastructure, including Nginx and MySQL.",
            "Built a CI/CD pipeline for automated, stable deployments.",
          ],
        },
        {
          category: "Management & Coordination",
          items: [
            "Led the Frontend team: assigned tasks and guided members through business workflows.",
            "Ensured output quality in both UI/UX and performance.",
          ],
        },
      ],
    },
    "exp-2": {
      role: "Fullstack .NET Developer Intern",
      period: "03/2024 — 10/2024",
      location: "Dong Nai, VN",
      description:
        "Developed Backend APIs with ASP.NET Core and Frontend interfaces for enterprise and school software systems.",
      details: [
        {
          category: "Backend & API Development",
          items: ["Designed and implemented a module-based API system on ASP.NET Core 8."],
        },
        {
          category: "UI/UX Optimization",
          items: [
            "Built modern interfaces with HTML5, CSS3 and KendoUI.",
            "Focused on improving responsive compatibility and user experience.",
          ],
        },
        {
          category: "Deployment & Operations",
          items: ["Worked directly with clients at schools to discuss requirements and hand over products."],
        },
      ],
      projectLinks: [
        { name: "Bac Lieu University", url: "https://blu.edu.vn/", logo: "/images/work-experience/blu.png" },
        { name: "Digital Library", url: "https://lib.blu.edu.vn/", logo: "/images/work-experience/blu.png" },
      ],
    },
    "exp-3": {
      role: "Frontend Developer (Freelance)",
      period: "11/2025 — 03/2026",
      location: "Dong Nai, VN",
      description:
        "Directly built a multi-domain Landing Page platform for the Lac Hong Bilingual School System.",
      details: [
        {
          category: "Analysis & Design",
          items: [
            "Built a Design System and Brand Guide to keep the school's branding consistent.",
            "Proactively aligned wireframes with the client at every stage.",
          ],
        },
        {
          category: "Monorepo Architecture",
          items: [
            "Used Turborepo to manage 4 different domains in a single codebase.",
            "Maximized reuse of shared component libraries, saving 50% of development time and keeping logic in sync.",
          ],
        },
        {
          category: "Performance & SEO",
          items: [
            "Focused on page load performance and SEO metrics for the landing pages.",
            "Kept the code clean and easy to index to improve reach to customers.",
          ],
        },
      ],
      projectLinks: [
        {
          name: "Lac Hong Bilingual School",
          url: "https://lhbs-edu-vn.devdotnet.id.vn/",
          logo: "/images/projects/project-content.svg",
        },
      ],
    },
  }),
  education: merge(homeVi.education, {
    "edu-1": { school: "Lac Hong University", degree: "Information Technology", period: "2026 — Present", location: "Dong Nai, VN" },
    "edu-2": { degree: ".NET Software Development", location: "Dong Nai, VN" },
    "edu-3": { school: "IIG Vietnam", degree: "TOEIC 650+ English Certificate", period: "2025", location: "Ho Chi Minh City, VN" },
    "edu-4": { degree: "UI/UX Design Professional Certificate", period: "2024" },
    "edu-5": {
      school: "Le Quang Dinh Secondary School",
      degree: "Lower Secondary School Diploma",
      location: "Dong Nai, VN",
    },
  }),
  skills: homeVi.skills,
  projects: merge(homeVi.projects, {
    "project-1": {
      summary:
        "A multi-role e-commerce platform (Client, Admin, Seller) with role-based access control (RBAC), payments (VNPay, Sepay) and Socket.IO.",
    },
    "project-2": {
      title: "Lac Hong Bilingual School",
      summary:
        "A multi-domain school system built on a Turborepo architecture that shares UI components (ShadCN). Fully optimized for SEO and responsiveness.",
    },
  }),
  testimonials: merge(homeVi.testimonials, {
    "testi-1": {
      name: "Mr. Tran Van Tay",
      role: "Founder & CEO",
      content:
        "Reliable expertise and a strong sense of responsibility. Great systems thinking, always proactive in proposing solutions and leading the team effectively.",
    },
    "testi-2": {
      name: "Mr. Hieu",
      role: "Project Manager",
      content:
        "Quickly grasps the business logic of enterprise software and writes careful code. Polished interfaces, optimized UX, and consistently outstanding delivery of core features.",
    },
    "testi-3": {
      name: "Mr. Le Chan Thien Tam",
      role: "Deputy Director",
      content:
        "Strong logical thinking and fast problem solving. A quick self-learner who applies new technology effectively, especially for UI/UX and performance optimization.",
    },
    "testi-4": {
      name: "Mr. Ho Hoang Chuong",
      role: "Head of IT Department",
      content:
        "Strong logical thinking and fast problem solving. A quick self-learner who applies new technology effectively, especially for UI/UX and performance optimization.",
    },
  }),
  contact: {
    ...homeVi.contact,
    badge: "Contact",
    headline: "Let's Build Something Great",
    subtext: "Have an exciting project or a collaboration opportunity? I'm always happy to listen and connect.",
    primaryCta: { ...homeVi.contact.primaryCta, label: "Send Email" },
    secondaryCta: { ...homeVi.contact.secondaryCta, label: "View CV" },
  },
  ui: {
    navbar: { logoLabel: "Home", navLabel: "Page sections" },
    hero: {
      greeting: "Hello! ",
      typed: ["I'm ERICSS.", "I'm a Fullstack Dev."],
      introName: "Nguyen Dang Phat",
      introBody:
        " — A professional software engineer. I love building digital products from backend logic to smooth, interactive frontends, focusing on an optimal user experience through the Next.js and TypeScript ecosystem.",
      avatarAlt: "Portrait of Nguyen Dang Phat",
      identityName: "Nguyen Dang Phat",
      techEcosystem: "Tech Ecosystem",
      techAlt: "Tech stack: React, Next.js, NestJS, TypeScript, PostgreSQL, Docker, Tailwind CSS, Figma",
      availableForWork: "Available For Work",
      location: "Ho Chi Minh City, VN",
      online: "Online",
    },
    experience: {
      badge: "Experience",
      title: "Career",
      accent: "Journey",
      description: "The key milestones that shaped my skills and product mindset.",
      viewDetails: "View details",
      website: "Website",
      modal: { close: "Close dialog", noDetails: "No detailed information yet.", featuredProjects: "Featured projects" },
    },
    education: {
      badge: "Education",
      title: "Education",
      accent: "& Certifications",
      description: "Academic foundation and programs that accelerated my expertise.",
    },
    skills: {
      badge: "Background",
      title: "Education",
      accent: "& Skills",
      description: "Academic foundation and the software development toolset.",
      learningJourney: "Learning Journey",
      techFocusTitle: "My Tech Stack Focus:",
      techFocusBody:
        "Deep expertise in React, Next.js (App Router) and the TypeScript ecosystem. Solid in Backend APIs with Node.js / ASP.NET Core and databases. Proficient with monorepos, Docker and CI/CD pipelines.",
      iconCloudLabel: "Icons of the technologies I use",
    },
    projects: {
      badge: "Portfolio",
      title: "Real-World",
      accent: "Projects",
      description: "Real products optimized for performance and user experience.",
      viewAll: "VIEW ALL PROJECTS",
      viewDetail: "VIEW DETAILS",
      sourceCode: "SOURCE CODE",
    },
    testimonials: {
      title: "What Colleagues",
      accent: "Say",
      description: "Honest feedback from managers and colleagues who have worked directly with me.",
    },
    contact: {
      nameLabel: "Your name",
      namePlaceholder: "Full name...",
      emailLabel: "Your email",
      emailPlaceholder: "hello@example.com",
      messageLabel: "Message",
      messagePlaceholder: "What would you like to discuss...",
      submit: "Send message",
      sending: "Sending...",
    },
  },
};
