import type { Locale } from "../locales";
import { blogEn } from "./en";
import { blogVi, type BlogContent } from "./vi";

export type { BlogContent, BlogUi } from "./vi";
export const BLOG_CONTENT: Record<Locale, BlogContent> = { vi: blogVi, en: blogEn };
