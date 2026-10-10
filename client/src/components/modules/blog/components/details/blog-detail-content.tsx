import Image from "next/image";
import type { BlogPost } from "@/config/blogs";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import type { BlogUi } from "@/content/blog";
import { PROSE_CLASSES } from "../../prose";
import { fmt } from "@/content/format";

export function BlogDetailContent({ post, ui }: { post: BlogPost; ui: BlogUi }) {
  return (
    <article className="relative min-h-screen pb-32 pt-24 md:pt-32 text-foreground overflow-x-hidden">
      {/* Dynamic Background Glow */}
      <div
        aria-hidden
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[90vw] md:w-[60vw] h-[400px] md:h-[600px] rounded-full blur-[120px] md:blur-[150px] opacity-15 pointer-events-none bg-[var(--color-cta)]"
      />

      <div className="ds-container max-w-4xl relative z-10">
        {/* Header Metadata */}
        <div className="flex items-center gap-3 text-xs md:text-sm font-semibold mb-6 justify-center">
          <span className="rounded-full bg-foreground/10 px-4 py-1.5 border border-foreground/20 shadow-lg text-foreground">
            {post.category}
          </span>
          <span className="text-foreground/60">
            {post.date} • {fmt(ui.readMinutes, { time: post.readTime })}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight text-center text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/60 mb-8 leading-tight px-4">
          {post.title}
        </h1>

        {/* Excerpt */}
        <p className="text-base md:text-xl text-center text-foreground/70 max-w-2xl mx-auto leading-relaxed mb-12 md:mb-16 px-4">
          {post.excerpt}
        </p>

        {/* Hero Cover Image */}
        <div className="w-full relative aspect-[16/9] rounded-2xl md:rounded-3xl overflow-hidden border border-border bg-secondary shadow-2xl mb-12 md:mb-24">
          <Image
            src={post.image}
            alt={fmt(ui.coverAlt, { title: post.title })}
            fill
            sizes="(min-width: 896px) 896px, 100vw"
            className="object-cover object-center"
            priority
          />
        </div>

        {/* Extended Markdown Content */}
        <div className={`${PROSE_CLASSES} prose-base md:prose-lg lg:prose-xl mx-auto px-4 md:px-0`}>
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>{post.content}</ReactMarkdown>
        </div>
      </div>
    </article>
  );
}
