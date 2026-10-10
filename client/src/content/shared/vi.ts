export const sharedVi = {
  siteNav: [
    { id: "home", label: "Trang chủ", href: "/" },
    { id: "projects", label: "Dự án", href: "/projects" },
    { id: "blog", label: "Bài viết", href: "/blog" },
  ],
  ui: {
    home: "Trang chủ",
    menu: "Menu",
    closeMenu: "Đóng menu",
    downloadCv: "Tải CV",
    breadcrumb: { blog: "Bài Viết", projects: "Dự Án" } as Record<string, string>,
    copyright: "Nguyễn Phát (ERICSS). Bảo lưu mọi quyền.",
    skipToContent: "Bỏ qua, đến nội dung chính",
    theme: { toggle: "Đổi giao diện", light: "Sáng", dark: "Tối", system: "Theo hệ thống" },
    language: { label: "Ngôn ngữ", vi: "Tiếng Việt", en: "English" },
  },
  meta: {
    siteName: "ERICSS | Nguyễn Đăng Phát",
    title: "ERICSS - Portfolio",
    description:
      "Portfolio của Nguyễn Đăng Phát (ERICSS) - Fullstack Developer chuyên về Next.js, TypeScript và kiến trúc hệ thống hiện đại.",
    keywords: [
      "Next.js", "React", "Tailwind CSS", "Fullstack Developer", "Nguyễn Đăng Phát", "ERICSS", "Portfolio", "Lập trình web",
    ],
    jobTitle: "Lập trình viên Fullstack",
    pages: {
      projects: {
        title: "Dự án & Sản phẩm thực tế",
        description: "Bộ sưu tập các dự án phần mềm, ứng dụng web và giải pháp công nghệ đã triển khai hoàn thiện bởi ERICSS.",
      },
      blog: {
        title: "Blog & Bài viết",
        description: "Chia sẻ kiến thức lập trình, kinh nghiệm phát triển phần mềm và cuộc sống.",
      },
    },
  },
};

export type SharedContent = typeof sharedVi;
