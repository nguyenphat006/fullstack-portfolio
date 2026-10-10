"use client";

import { useState, useMemo } from "react";
import { SectionHeader } from "@/components/shared/section-header";
import { useLanding } from "@/content/provider";
import { BlogGrid } from "./components/blog-grid";
import { cn } from "@/lib/utils";

export function BlogIndex() {
  const { blog, shared } = useLanding();
  const { ui, posts } = blog;
  // null = "Tất cả"; lưu null thay vì chữ để đổi ngôn ngữ không làm lệch bộ lọc
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = useMemo(() => Array.from(new Set(posts.map((p) => p.category))), [posts]);

  const filteredPosts = useMemo(
    () => (activeCategory === null ? posts : posts.filter((post) => post.category === activeCategory)),
    [activeCategory, posts],
  );

  const options: { value: string | null; label: string }[] = [
    { value: null, label: ui.all },
    ...categories.map((c) => ({ value: c, label: c })),
  ];

  return (
    <div className="ds-section pt-16 pb-24 relative min-h-screen">
      <div className="ds-container space-y-12">
        <h1 className="sr-only">{shared.meta.pages.blog.title}</h1>
        <SectionHeader badge={ui.badge} title={ui.title} description={ui.description} />

        {/* Bộ lọc Category Filter Navigation */}
        <div role="group" aria-label={ui.filterLabel} className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
          {options.map(({ value, label }) => (
            <button
              key={value ?? "all"}
              type="button"
              aria-pressed={activeCategory === value}
              onClick={() => setActiveCategory(value)}
              className={cn(
                "px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border backdrop-blur-md",
                activeCategory === value
                  ? "bg-[var(--color-cta)] text-background border-[var(--color-cta)] shadow-lg scale-105"
                  : "bg-foreground/5 text-foreground/70 border-foreground/10 hover:bg-foreground/10 hover:text-foreground hover:scale-105",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Lưới phân bổ Content */}
        <BlogGrid posts={filteredPosts} />
      </div>
    </div>
  );
}
