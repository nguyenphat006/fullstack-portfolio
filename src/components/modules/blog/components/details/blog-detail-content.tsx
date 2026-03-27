import Image from "next/image";
import type { BlogPost } from "@/config/blogs";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

export function BlogDetailContent({ post }: { post: BlogPost }) {
  return (
    <article className="relative min-h-screen pb-32 pt-24 md:pt-32 text-white overflow-x-hidden">
      {/* Dynamic Background Glow */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[90vw] md:w-[60vw] h-[400px] md:h-[600px] rounded-full blur-[120px] md:blur-[150px] opacity-15 pointer-events-none bg-[var(--color-cta)]"
      />

      <div className="ds-container max-w-4xl relative z-10">
        
        {/* Header Metadata */}
        <div className="flex items-center gap-3 text-xs md:text-sm text-[var(--color-cta)] font-semibold mb-6 justify-center">
            <span className="rounded-full bg-[var(--color-cta)]/10 px-4 py-1.5 border border-[var(--color-cta)]/20 shadow-lg">{post.category}</span>
            <span className="text-white/40">{post.date} • {post.readTime} đọc</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight text-center text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60 mb-8 leading-tight px-4">
          {post.title}
        </h1>

        {/* Excerpt */}
        <p className="text-base md:text-xl text-center text-white/60 max-w-2xl mx-auto leading-relaxed mb-12 md:mb-16 px-4">
          {post.excerpt}
        </p>

        {/* Hero Cover Image */}
        <div className="w-full relative aspect-[16/9] rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 bg-black/40 shadow-2xl backdrop-blur-sm mb-12 md:mb-24">
           <Image 
              src={post.image} 
              alt={post.title} 
              fill 
              className="object-cover object-center" 
              priority
           />
           {/* Fade overlay so text below pops if we stick anything over it */}
           <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-[#0E0E0E] to-transparent pointer-events-none rounded-b-3xl" />
        </div>

        {/* Extended Markdown Content */}
        <div className="prose prose-invert prose-base md:prose-lg lg:prose-xl max-w-none prose-headings:text-[var(--color-cta)] prose-a:text-[var(--color-cta)] hover:prose-a:text-white prose-a:transition-colors prose-img:rounded-2xl md:prose-img:rounded-3xl prose-img:shadow-2xl prose-img:border prose-img:border-white/5 prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 mx-auto px-4 md:px-0">
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>
            {post.content}
          </ReactMarkdown>
        </div>

      </div>
    </article>
  );
}
