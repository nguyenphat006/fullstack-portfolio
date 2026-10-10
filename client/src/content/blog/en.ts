import { BLOG_POSTS } from "@/config/blogs";
import type { BlogContent } from "./vi";

const byId = Object.fromEntries(BLOG_POSTS.map((p) => [p.id, p]));

export const blogEn: BlogContent = {
  ui: {
    badge: "Journal",
    title: "Sharing Corner",
    description:
      "Knowledge, stories and lessons learned from building with React, Next.js and backend system architecture.",
    all: "All",
    filterLabel: "Filter posts by topic",
    empty: "No matching posts found.",
    readMinutes: "{time}",
    readPost: "Read post",
    readPostNamed: "Read post: {title}",
    coverAlt: "{title}",
  },
  posts: [
    {
      ...byId["post-1"],
      title: "A Guide to Building a Design System with Tailwind CSS",
      excerpt: "How to set up design tokens and well-structured, reusable components for large Next.js projects.",
      date: "Mar 10, 2026",
      category: "Frontend",
      readTime: "5 min read",
      content: `## Building a Consistent UI System

In real projects, setting up a shared core for the interface is a must. Plain CSS often runs into problems such as:
1. Duplicated class names.
2. No standard for spacing.
3. Supporting Dark Mode is extremely painful.

### The Solution with Tailwind CSS
Combining Tailwind with [shadcn/ui](https://ui.shadcn.com/) removes the dependency on heavyweight CSS frameworks entirely. You define your \`Colors\` palette in \`tailwind.config.ts\` once and use it anywhere in the system.`,
    },
    {
      ...byId["post-2"],
      title: "Turborepo: Managing Multi-domain Projects",
      excerpt:
        "An effective monorepo architecture that saves dozens of hours on framework maintenance and UI component sharing.",
      date: "Feb 25, 2026",
      category: "Architecture",
      readTime: "8 min read",
      content: `## What is a Monorepo?

A monorepo solves the age-old problem of having many domains that share one brand identity. Instead of copying code from one project to another (copy-paste), **Turborepo** lets you create a single repository.

> Core systems such as **UI**, **Linting** and **TypeScript Config** are packaged as shared \`packages\`. Each \`app\` simply imports them like an NPM library.

This lets team leads manage a huge frontend system with zero duplication!`,
    },
    {
      ...byId["post-3"],
      title: "Optimizing Images and Fonts in the Next.js App Router",
      excerpt: "The Core Web Vitals techniques you need to know when working with Next.js in 2026.",
      date: "Jan 14, 2026",
      category: "Performance",
      readTime: "6 min read",
      content: `## A 100/100 PageSpeed Insights Score Is Not a Dream

When a page loads, images and fonts are the two main causes of **CLS (Cumulative Layout Shift)**.

### Tip 1: Preload Fonts
Next.js ships with the \`next/font/google\` module: just declare the font at the very top of \`layout.tsx\`. The framework downloads the real font file and injects it into the HTML at build time. Even when the network drops, the font still renders correctly.

### Tip 2: The Magical Image Component
Forget the traditional \`<img />\` tag and use \`next/image\` instead. If you cannot determine a fixed size, use the \`fill\` trick together with the \`object-cover\` class. The framework quietly crops and resizes the image to a very light WebP format (only about 50KB).`,
    },
  ],
};
