import { SectionHeader } from "@/components/shared/section-header";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "Blog & Bài Viết - ERICSS",
  description: "Chia sẻ kiến thức lập trình, kinh nghiệm phát triển phần mềm và cuộc sống.",
};

const BLOG_POSTS = [
  {
    id: "post-1",
    title: "Hướng dẫn xây dựng Design System với Tailwind CSS",
    excerpt: "Cách thiết lập hệ thống design token, component chuẩn chỉnh và tái sử dụng hiệu quả cho các dự án Next.js lớn.",
    date: "10/03/2026",
    category: "Frontend",
    readTime: "5 phút",
    slug: "#",
  },
  {
    id: "post-2",
    title: "Turborepo: Giải pháp quản lý Dự án Đa tên miền",
    excerpt: "Kiến trúc Monorepo hiệu quả giúp tiết kiệm hàng chục giờ đồng hồ cho việc bảo trì framework, chia sẻ UI component.",
    date: "25/02/2026",
    category: "Architecture",
    readTime: "8 phút",
    slug: "#",
  },
  {
    id: "post-3",
    title: "Tối ưu hóa hình ảnh và Font chữ trên Next.js App Router",
    excerpt: "Những kỹ thuật Core Web Vitals bạn phải biết khi làm việc với framework Next.js trong năm 2026.",
    date: "14/01/2026",
    category: "Performance",
    readTime: "6 phút",
    slug: "#",
  }
];

export default function BlogPage() {
  return (
    <div className="ds-section pt-16 pb-24 relative">
      <div className="ds-container space-y-16">
        <SectionHeader
          badge="Nhật Ký"
          title="Góc Chia Sẻ"
          description="Những kiến thức, câu chuyện và trải nghiệm được đúc kết qua quá trình làm việc bằng React, Next.js và kiến trúc backend."
        />

        <div className="mx-auto max-w-4xl space-y-6">
          {BLOG_POSTS.map((post) => (
            <article key={post.id} className="group relative flex flex-col items-start justify-between rounded-[2rem] border border-white/5 bg-white/5 p-6 shadow-xl backdrop-blur-sm transition-all hover:bg-white/10 sm:flex-row sm:items-center sm:p-8">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3 text-sm font-semibold text-[var(--color-cta)]">
                  <span className="rounded-full bg-[var(--color-cta)]/10 px-3 py-1 border border-[var(--color-cta)]/20">{post.category}</span>
                  <span className="font-medium text-white/40">{post.date} • {post.readTime} đọc</span>
                </div>
                <h3 className="text-xl font-bold text-white transition-colors group-hover:text-[var(--color-cta)] sm:text-2xl leading-tight">
                  {post.title}
                </h3>
                <p className="text-sm leading-relaxed text-white/60 sm:text-base">
                  {post.excerpt}
                </p>
              </div>
              
              <div className="mt-6 flex shrink-0 items-center justify-center sm:ml-8 sm:mt-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-cta)]/30 bg-[var(--color-cta)]/10 text-[var(--color-cta)] transition-all group-hover:scale-110 group-hover:bg-[var(--color-cta)] group-hover:text-black">
                  <ArrowRight className="h-5 w-5" />
                </div>
              </div>
              <Link href={post.slug} className="absolute inset-0 z-10">
                <span className="sr-only">Read {post.title}</span>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
