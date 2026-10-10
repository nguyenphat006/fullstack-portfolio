import type { SharedContent } from "./vi";

export const sharedEn: SharedContent = {
  siteNav: [
    { id: "home", label: "Home", href: "/" },
    { id: "projects", label: "Projects", href: "/projects" },
    { id: "blog", label: "Blog", href: "/blog" },
  ],
  ui: {
    home: "Home",
    menu: "Menu",
    closeMenu: "Close menu",
    downloadCv: "Download CV",
    breadcrumb: { blog: "Blog", projects: "Projects" },
    copyright: "Nguyen Phat (ERICSS). All rights reserved.",
    skipToContent: "Skip to main content",
    theme: { toggle: "Toggle theme", light: "Light", dark: "Dark", system: "System" },
    language: { label: "Language", vi: "Tiếng Việt", en: "English" },
  },
  meta: {
    siteName: "ERICSS | Nguyen Dang Phat",
    title: "ERICSS - Portfolio",
    description:
      "Portfolio of Nguyen Dang Phat (ERICSS) - a Fullstack Developer focused on Next.js, TypeScript and modern system architecture.",
    keywords: [
      "Next.js", "React", "Tailwind CSS", "Fullstack Developer", "Nguyen Dang Phat", "ERICSS", "Portfolio", "Web development",
    ],
    jobTitle: "Fullstack Developer",
    pages: {
      projects: {
        title: "Projects & Real-world Products",
        description: "A collection of software projects, web apps and technology solutions delivered by ERICSS.",
      },
      blog: {
        title: "Blog & Articles",
        description: "Notes on programming, software engineering experience and life.",
      },
    },
  },
};
