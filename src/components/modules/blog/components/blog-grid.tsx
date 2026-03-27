import type { BlogPost } from "@/config/blogs";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export function BlogGrid({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-white/50 text-lg">
        Không tìm thấy bài viết nào phù hợp.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {posts.map((post) => (
        <article key={post.id} className="group relative flex flex-col rounded-[2rem] border border-white/5 bg-white/5 p-4 shadow-xl backdrop-blur-sm transition-all hover:bg-white/10 hover:-translate-y-2 overflow-hidden">
          {/* Cover Image Placeholder Container */}
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-6 bg-black/40">
            <Image 
              src={post.image} 
              alt={post.title} 
              fill 
              className="object-cover transition-transform duration-700 group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E0E]/80 to-transparent opacity-60 pointer-events-none" />
            
            {/* Category Overlay Tag */}
            <div className="absolute top-4 left-4 z-10">
               <span className="rounded-full bg-black/60 backdrop-blur-md px-3 py-1.5 text-xs font-bold text-[var(--color-cta)] border border-[var(--color-cta)]/20 shadow-lg">
                 {post.category}
               </span>
            </div>
          </div>

          <div className="flex flex-col flex-1 px-2 pb-2">
            <div className="flex items-center gap-3 text-sm text-[var(--color-cta)] mb-3">
              <span className="font-medium text-white/40">{post.date} • {post.readTime} đọc</span>
            </div>
            
            <h3 className="text-xl font-bold text-white transition-colors group-hover:text-[var(--color-cta)] leading-tight mb-3">
              {post.title}
            </h3>
            
            <p className="text-sm leading-relaxed text-white/60 flex-1 mb-6 line-clamp-3">
              {post.excerpt}
            </p>
            
            <div className="mt-auto flex items-center gap-2 text-[var(--color-cta)] font-semibold text-sm transition-all group-hover:underline underline-offset-4">
               Đọc bài viết <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          <Link href={`/blog/${post.slug}`} className="absolute inset-0 z-20">
            <span className="sr-only">Đọc bài viết {post.title}</span>
          </Link>
        </article>
      ))}
    </div>
  );
}
