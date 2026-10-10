/** Class markdown dùng chung cho bài viết và dự án: đọc tốt ở cả giao diện sáng và tối. */
export const PROSE_CLASSES = [
  "prose dark:prose-invert max-w-none",
  "prose-headings:text-foreground prose-headings:font-bold",
  "prose-p:text-foreground/80 prose-li:text-foreground/80 prose-strong:text-foreground",
  "prose-a:text-[var(--color-cta)] prose-a:underline prose-a:underline-offset-4 prose-a:transition-opacity hover:prose-a:opacity-80",
  "prose-code:rounded prose-code:bg-secondary prose-code:px-1.5 prose-code:py-0.5 prose-code:text-foreground prose-code:before:content-none prose-code:after:content-none",
  "prose-pre:border prose-pre:border-border prose-pre:bg-secondary prose-pre:text-foreground",
  "prose-blockquote:border-l-[var(--color-cta)] prose-blockquote:text-foreground/70",
  "prose-th:text-foreground prose-td:text-foreground/80 prose-thead:border-border prose-tr:border-border",
  "prose-hr:border-border prose-img:rounded-2xl prose-img:shadow-2xl",
].join(" ");
