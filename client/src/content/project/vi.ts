import { PROJECTS_DATA, type ProjectItem } from "@/config/projects";

export interface ProjectUi {
  badge: string;
  title: string;
  description: string;
  prev: string;
  next: string;
  yearLabel: string;
  viewProject: string; // {title}
  thumbAlt: string; // {title}
  team: string;
  period: string;
  stack: string;
  live: string;
  source: string;
}

export interface ProjectContent {
  ui: ProjectUi;
  items: ProjectItem[];
}

export const projectVi: ProjectContent = {
  ui: {
    badge: "Sản phẩm",
    title: "Dự án Nổi bật",
    description:
      "Khám phá các sản phẩm và hệ thống mà mình đã tự tay thiết kế kiến trúc và triển khai trong suốt quãng thời gian làm nghề.",
    prev: "Trang trước",
    next: "Trang sau",
    yearLabel: "NĂM /",
    viewProject: "Xem chi tiết dự án {title}",
    thumbAlt: "{title}",
    team: "Đội ngũ & Vai trò",
    period: "Thời gian triển khai",
    stack: "Ngăn xếp Công nghệ",
    live: "Truy cập Trực tiếp",
    source: "Khám phá Mã nguồn",
  },
  items: PROJECTS_DATA,
};
