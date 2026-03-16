"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, BookOpen01Icon } from "@hugeicons/core-free-icons";
import { SectionHeader } from "@/components/shared/section-header";
import { shortSentence } from "@/lib/utils";
import { HOME_BLOG_POSTS } from "../constants";

export function HomeBlogPreview() {
  return (
    <section id="bai-viet" className="ds-section relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute right-[12%] top-6 h-32 w-32 rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="ds-container relative space-y-12">
        <SectionHeader
          badge="Blog"
          title="Góc"
          accent="Chia Sẻ"
          description="Những ghi chú ngắn về kiến trúc, design system và tối ưu hiệu năng."
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {HOME_BLOG_POSTS.map((post, i) => (
            <motion.article
              key={post.id}
              className="ds-glow-card overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <div className="relative -mx-6 -mt-6 mb-5 h-40 overflow-hidden bg-secondary/30">
                <Image src={post.thumbnail} alt={post.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white/80">
                  <HugeiconsIcon icon={BookOpen01Icon} size={14} />
                  {post.category}
                </span>
              </div>

              <div className="flex h-full flex-col justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-white/50">
                    <span>{post.publishedAt}</span>
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white">{post.title}</h3>
                  <p className="text-sm leading-relaxed text-white/70">
                    {shortSentence(post.excerpt)}
                  </p>
                </div>

                <Link
                  href={post.href}
                  className="inline-flex cursor-pointer items-center text-sm font-medium text-[var(--color-cta)] transition-colors duration-200 hover:text-[var(--color-accent-earth)]"
                >
                  Đọc thêm
                  <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="ml-1" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
