import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, BookOpen01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { HOME_BLOG_POSTS } from "../constants";

export function HomeBlogPreview() {
  return (
    <section id="bai-viet" className="ds-section">
      <div className="ds-container space-y-10">
        <div className="space-y-3 ds-reveal">
          <p className="ds-badge">Bài Viết</p>
          <h2 className="text-3xl font-bold tracking-tight text-[var(--color-text)] md:text-4xl lg:text-5xl">
            Blog <span className="ds-gradient-text">Kỹ Thuật</span>
          </h2>
          <p className="max-w-3xl text-base text-[var(--color-text-muted)] md:text-lg">
            Chia sẻ kinh nghiệm về kiến trúc, design systems và hiệu năng web từ quá trình phát triển thực tế.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {HOME_BLOG_POSTS.map((post, i) => (
            <article
              key={post.id}
              className={`ds-glow-card ds-reveal ds-reveal-delay-${i + 1}`}
            >
              <div className="flex h-full flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-secondary)]/60 px-3 py-1 text-xs font-medium text-[var(--color-text)]">
                      <HugeiconsIcon icon={BookOpen01Icon} size={14} />
                      {post.category}
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {post.publishedAt}
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-semibold text-[var(--color-text)]">
                    {post.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-muted)]">
                    {post.excerpt}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <span className="text-xs font-medium text-[var(--color-text-muted)]">
                    {post.readTime}
                  </span>
                  <Link
                    href={post.href}
                    className="inline-flex cursor-pointer items-center text-sm font-medium text-[var(--color-cta)] transition-colors duration-200 hover:text-[var(--color-accent-earth)]"
                  >
                    Đọc thêm
                    <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="ml-1" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="flex justify-center ds-reveal ds-reveal-delay-4">
          <Button asChild variant="outline" className="ds-btn-secondary">
            <Link href="/blog" className="cursor-pointer">
              Xem Tất Cả Bài Viết
              <HugeiconsIcon icon={ArrowRight01Icon} size={18} className="ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
