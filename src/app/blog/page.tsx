import { BlogModulePage } from "@/components/modules/blog";
import { constructMetadata } from "@/config/site";

export const metadata = constructMetadata({
  title: "Bài viết & Chia sẻ công nghệ",
  description: "Các kiến thức thực chiến về lập trình, kiến trúc Frontend và phong cách sống của chuyên gia phát triển phần mềm ERICSS.",
});

export default function BlogPage() {
  return <BlogModulePage />;
}
