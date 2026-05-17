"use client";

import { useState, useMemo } from "react";
import { BLOG_POSTS } from "@/config/blogs";
import { SectionHeader } from "@/components/shared/section-header";
import { BlogGrid } from "./components/blog-grid";
import { cn } from "@/lib/utils";

const CATEGORIES = ["Tất cả", ...Array.from(new Set(BLOG_POSTS.map(p => p.category)))];

export function BlogIndex() {
  const [activeCategory, setActiveCategory] = useState("Tất cả");

  const filteredPosts = useMemo(() => {
    if (activeCategory === "Tất cả") return BLOG_POSTS;
    return BLOG_POSTS.filter(post => post.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="ds-section pt-16 pb-24 relative min-h-screen">
      <div className="ds-container space-y-12">
        <SectionHeader
          badge="Nhật Ký"
          title="Góc Chia Sẻ"
          description="Những kiến thức, câu chuyện và trải nghiệm được đúc kết qua quá trình làm việc bằng React, Next.js và kiến trúc hệ thống backend."
        />

        {/* Bộ lọc Category Filter Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
          {CATEGORIES.map(category => (
            <button
               key={category}
               onClick={() => setActiveCategory(category)}
               className={cn(
                 "px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border backdrop-blur-md",
                 activeCategory === category 
                   ? "bg-[var(--color-cta)] text-black border-[var(--color-cta)] shadow-[0_0_20px_rgba(255,255,255,0.15)] scale-105" 
                   : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white hover:scale-105"
               )}
            >
               {category}
            </button>
          ))}
        </div>

        {/* Lưới phân bổ Content */}
        <BlogGrid posts={filteredPosts} />
      </div>
    </div>
  );
}
