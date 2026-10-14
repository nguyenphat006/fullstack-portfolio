import "server-only";
import type { BlogPost } from "@/config/blogs";
import type { ProjectItem } from "@/config/projects";
import type { Locale } from "@/content/locales";

/**
 * Gọi API công khai của Django (/api/v1/public/*) từ server component của landing.
 * Không cấu hình API hoặc API lỗi -> trả null để landing dùng dữ liệu tĩnh dự phòng (landing không bao giờ hỏng vì backend).
 * Dữ liệu được cache và tự làm mới sau REVALIDATE_SECONDS (ISR).
 */
const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
const REVALIDATE_SECONDS = 300;
const TIMEOUT_MS = 4000;

interface Envelope<T> { success: boolean; data: T }
interface Page<T> { results: T[]; next: string | null }

async function fetchAll<T>(path: string, locale: Locale): Promise<T[] | null> {
  if (!API_URL) return null;
  try {
    const items: T[] = [];
    let url: string | null = `${API_URL}${path}?lang=${locale}&page_size=100`;
    while (url) {
      const res: Response = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS, tags: ["content"] }, signal: AbortSignal.timeout(TIMEOUT_MS) });
      if (!res.ok) return null;
      const body = (await res.json()) as Envelope<Page<T>>;
      if (!body.success) return null;
      items.push(...body.data.results);
      url = body.data.next;
    }
    return items;
  } catch {
    return null;
  }
}

interface ApiProject {
  slug: string; title: string; summary: string; stack: string[]; year: string; image: string; color: string; role: string;
  content: string; live_url: string | null; github_url: string | null; featured: boolean;
}

interface ApiBlog {
  slug: string; title: string; excerpt: string; published_date: string; category: string; read_time: string; image: string; content: string;
}

export async function fetchPublicProjects(locale: Locale): Promise<ProjectItem[] | null> {
  const rows = await fetchAll<ApiProject>("/public/projects/", locale);
  return (
    rows?.map((p) => ({
      id: p.slug, title: p.title, summary: p.summary, stack: p.stack ?? [], year: p.year, image: p.image, color: p.color,
      role: p.role, content: p.content, liveUrl: p.live_url ?? undefined, githubUrl: p.github_url ?? undefined, featured: p.featured,
    })) ?? null
  );
}

export async function fetchPublicBlogs(locale: Locale): Promise<BlogPost[] | null> {
  const rows = await fetchAll<ApiBlog>("/public/blogs/", locale);
  return (
    rows?.map((b) => ({
      id: b.slug, slug: b.slug, title: b.title, excerpt: b.excerpt, date: b.published_date, category: b.category,
      readTime: b.read_time, image: b.image, content: b.content,
    })) ?? null
  );
}

/** Nội dung CMS của trang chủ (các phần đang bật), theo ngôn ngữ. Lỗi / chưa cấu hình -> null (dùng nội dung mặc định). */
export async function fetchPublicLanding(locale: Locale): Promise<Record<string, unknown> | null> {
  if (!API_URL) return null;
  try {
    const res = await fetch(`${API_URL}/public/landing/?lang=${locale}`, {
      next: { revalidate: REVALIDATE_SECONDS, tags: ["landing"] },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as Envelope<Record<string, unknown>>;
    return body.success ? body.data : null;
  } catch {
    return null;
  }
}

/** Lưu liên hệ từ form landing vào CSDL (best effort: lỗi thì bỏ qua, mail vẫn là kênh chính). */
export async function savePublicContact(input: { name: string; email: string; message: string }): Promise<boolean> {
  if (!API_URL) return false;
  try {
    const res = await fetch(`${API_URL}/public/contacts/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}
