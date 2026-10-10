import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Khu quản trị không cần lập chỉ mục
        disallow: ["/login", "/dashboard", "/users", "/content/", "/audit-logs", "/settings", "/profile", "/403"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
