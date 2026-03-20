import { Metadata } from "next";

export const siteConfig = {
  name: "ERICSS | Nguyễn Đăng Phát",
  title: "ERICSS - Portfolio",
  description: "Portfolio của Nguyễn Đăng Phát (ERICSS) - Fullstack Developer chuyên về Next.js, TypeScript và kiến trúc hệ thống hiện đại.",
  url: "https://dangphat.dev", // Replace with your actual domain if different
  ogImage: "/images/og-image.png",
  links: {
    github: "https://github.com/nguyenphat006",
    facebook: "https://facebook.com/nphat.dev",
    linkedin: "https://linkedin.com/in/nguyen-dang-phat",
  },
  keywords: [
    "Next.js",
    "React",
    "Tailwind CSS",
    "Server Components",
    "Fullstack Developer",
    "Nguyễn Đăng Phát",
    "ERICSS",
    "Portfolio",
    "Web Development",
  ],
};

export function constructMetadata({
  title = siteConfig.title,
  description = siteConfig.description,
  image = siteConfig.ogImage,
  noIndex = false,
}: {
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
} = {}): Metadata {
  return {
    title: {
      default: title,
      template: `%s | ${siteConfig.name}`,
    },
    description,
    keywords: siteConfig.keywords,
    authors: [
      {
        name: siteConfig.name,
      },
    ],
    creator: siteConfig.name,
    openGraph: {
      type: "website",
      locale: "vi_VN",
      url: siteConfig.url,
      title,
      description,
      siteName: siteConfig.name,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: "@ericss", // Replace with actual handle if needed
    },
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon-16x16.png",
      apple: "/apple-touch-icon.png",
    },
    metadataBase: new URL(siteConfig.url),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}
