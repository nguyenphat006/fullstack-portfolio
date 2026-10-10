import { BLOG_POSTS, type BlogPost } from "@/config/blogs";

export interface BlogUi {
  badge: string;
  title: string;
  description: string;
  all: string;
  filterLabel: string;
  empty: string;
  readMinutes: string; // {time}
  readPost: string;
  readPostNamed: string; // {title}
  coverAlt: string; // {title}
}

export interface BlogContent {
  ui: BlogUi;
  posts: BlogPost[];
}

export const blogVi: BlogContent = {
  ui: {
    badge: "Nhật Ký",
    title: "Góc Chia Sẻ",
    description:
      "Những kiến thức, câu chuyện và trải nghiệm được đúc kết qua quá trình làm việc bằng React, Next.js và kiến trúc hệ thống backend.",
    all: "Tất cả",
    filterLabel: "Lọc bài viết theo chủ đề",
    empty: "Không tìm thấy bài viết nào phù hợp.",
    readMinutes: "{time} đọc",
    readPost: "Đọc bài viết",
    readPostNamed: "Đọc bài viết {title}",
    coverAlt: "{title}",
  },
  posts: BLOG_POSTS,
};
