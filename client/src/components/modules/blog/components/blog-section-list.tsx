import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, BookOpen01Icon } from "@hugeicons/core-free-icons";
import { BLOG_SECTION_POSTS } from "../constants";

export function BlogSectionList() {
  return (
    <section className="ds-section">
      <div className="ds-container space-y-8">
        <div className="space-y-3">
          <p className="ds-badge">Technical Writing</p>
          <h1 className="text-4xl font-bold tracking-tight text-[var(--color-text)] md:text-5xl">Blog</h1>
          <p className="max-w-3xl text-base text-[var(--color-text-muted)] md:text-lg">
            Insights on architecture, design systems, and frontend performance from real product delivery.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {BLOG_SECTION_POSTS.map((post) => (
            <article key={post.id} className="ds-card">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-secondary)]/60 px-3 py-1 text-xs font-medium text-[var(--color-text)]">
                  <HugeiconsIcon icon={BookOpen01Icon} size={14} />
                  {post.category}
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">{post.publishedAt}</span>
              </div>

              <h2 className="mt-4 text-xl font-semibold text-[var(--color-text)]">{post.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-muted)]">{post.excerpt}</p>

              <div className="mt-6 flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--color-text-muted)]">{post.readTime}</span>
                <Link href={post.href} className="inline-flex cursor-pointer items-center text-sm font-medium text-[var(--color-cta)]">
                  Read more
                  <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="ml-1" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
