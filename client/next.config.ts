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
  output: "standalone",
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
    return PUBLIC_MEDIA.map((dir) => ({ source: `/media/${dir}/:path*`, destination: `${API_ORIGIN}/media/${dir}/:path*` }));
  },
};

export default withNextIntl(nextConfig);
