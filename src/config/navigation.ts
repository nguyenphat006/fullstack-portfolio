export type NavItem = {
  id: string;
  label: string;
  href: string;
};

export const SITE_NAV_LINKS: NavItem[] = [
  { id: "home", label: "Trang chủ", href: "/" },
  { id: "projects", label: "Dự án", href: "/projects" },
  { id: "blog", label: "Bài viết", href: "/blog" },
];
