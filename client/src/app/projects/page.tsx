import { ProjectModulePage } from "@/components/modules/project";
import { constructMetadata } from "@/config/site";

export const metadata = constructMetadata({
  title: "Dự án & Sản phẩm thực tế",
  description: "Bộ sưu tập các dự án phần mềm, ứng dụng web và các giải pháp công nghệ đã triển khai hoàn thiện bởi ERICSS.",
});

export default function ProjectsPage() {
  return <ProjectModulePage />;
}
