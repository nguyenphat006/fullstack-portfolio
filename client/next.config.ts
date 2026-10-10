import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

/** Đa ngôn ngữ: cấu hình theo request (cookie) ở src/i18n/request.ts */
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** Gốc backend (bỏ hậu tố /api/v1) — dùng cho ảnh công khai trong /media */
const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1").replace(/\/api\/v1\/?$/, "");

/** Thư mục media công khai (logo, avatar). Tệp đính kèm KHÔNG ở đây — chỉ tải qua link có chữ ký. */
const PUBLIC_MEDIA = ["branding", "avatars"];

const nextConfig: NextConfig = {
  // Docker production: đóng gói server tối giản (.next/standalone) — xem client/Dockerfile
  // Vercel tự đóng gói; standalone chỉ dùng cho Docker (làm hỏng bước trace trên Vercel)
  output: process.env.VERCEL ? undefined : "standalone",
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
  // Landing page: ảnh dự án / blog lấy từ nhiều nguồn ngoài
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  // Dev (frontend :3000, backend :8000): chuyển ảnh công khai sang backend. Production: nginx phục vụ /media trước.
  async rewrites() {
    return {
      // Landing đa ngôn ngữ: tiếng Anh là mặc định và KHÔNG có tiền tố (/, /blog, /projects/...),
      // nội bộ được map sang segment [locale] = en. Tiếng Việt nằm dưới /vi/... (đổi mặc định: sửa DEFAULT_LOCALE + khối này)
      beforeFiles: [
        { source: "/", destination: "/en" },
        { source: "/blog", destination: "/en/blog" },
        { source: "/blog/:slug", destination: "/en/blog/:slug" },
        { source: "/projects", destination: "/en/projects" },
        { source: "/projects/:id", destination: "/en/projects/:id" },
      ],
      afterFiles: PUBLIC_MEDIA.map((dir) => ({ source: `/media/${dir}/:path*`, destination: `${API_ORIGIN}/media/${dir}/:path*` })),
      fallback: [],
    };
  },
  // /en/... là bản trùng của /... -> chuyển vĩnh viễn để tránh nội dung trùng lặp (SEO)
  async redirects() {
    return [
      { source: "/en", destination: "/", permanent: true },
      { source: "/en/:path*", destination: "/:path*", permanent: true },
    ];
  },
};

export default withNextIntl(nextConfig);
