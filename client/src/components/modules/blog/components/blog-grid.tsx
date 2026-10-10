"use client";

import type { BlogPost } from "@/config/blogs";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useLanding } from "@/content/provider";
import { fmt } from "@/content/format";

export function BlogGrid({ posts }: { posts: BlogPost[] }) {
  const { blog, path } = useLanding();
  const { ui } = blog;

  if (posts.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-foreground/60 text-lg">{ui.empty}</div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {posts.map((post, index) => (
        <article
          key={post.id}
          className="group relative flex flex-col rounded-[2rem] border border-border bg-card p-4 shadow-xl transition-all hover:bg-secondary hover:-translate-y-2 overflow-hidden"
        >
          {/* Cover Image Container */}
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-6 bg-secondary">
            <Image
              src={post.image}
              alt={fmt(ui.coverAlt, { title: post.title })}
              fill
              sizes="(min-width: 1024px) 380px, (min-width: 768px) 45vw, 100vw"
              priority={index === 0}
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60 pointer-events-none" />

            {/* Category Overlay Tag */}
            <div className="absolute top-4 left-4 z-10">
              <span className="rounded-full bg-background/80 backdrop-blur-md px-3 py-1.5 text-xs font-bold text-foreground border border-border shadow-lg">
                {post.category}
              </span>
            </div>
          </div>

          <div className="flex flex-col flex-1 px-2 pb-2">
            <div className="flex items-center gap-3 text-sm mb-3">
              <span className="font-medium text-foreground/60">
                {post.date} • {fmt(ui.readMinutes, { time: post.readTime })}
              </span>
            </div>

            <h3 className="text-xl font-bold text-foreground transition-colors leading-tight mb-3">{post.title}</h3>

            <p className="text-sm leading-relaxed text-foreground/70 flex-1 mb-6 line-clamp-3">{post.excerpt}</p>

            <div className="mt-auto flex items-center gap-2 text-foreground font-semibold text-sm transition-all group-hover:underline underline-offset-4">
              {ui.readPost} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          <Link href={path(`/blog/${post.slug}`)} className="absolute inset-0 z-20">
            <span className="sr-only">{fmt(ui.readPostNamed, { title: post.title })}</span>
          </Link>
        </article>
      ))}
    </div>
  );
}
