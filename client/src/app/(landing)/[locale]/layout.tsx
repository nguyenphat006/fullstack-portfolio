import { notFound } from "next/navigation";
import { Figtree, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "../landing.css";
import { cn } from "@/lib/utils";
import { absoluteUrl, constructMetadata, jsonLd, siteConfig } from "@/config/site";
import { getContent, isLocale, LOCALES } from "@/content";
import { LandingProvider } from "@/content/provider";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { SharedDock } from "@/components/shared/layout/shared-dock";
import { Footer } from "@/components/shared/layout/footer";
import { PageBackground } from "@/components/shared/layout/page-background";
import { SubpageHeader } from "@/components/shared/layout/subpage-header";
import { HomeContactSection as ContactSection } from "@/components/shared/layout/contact-section";
import { Toaster } from "@/components/landing/ui/sonner";
import { Preloader } from "@/components/shared/layout/preloader";

// Figtree là font chính: latin-ext phủ các ký tự có dấu tiếng Việt (Figtree không có subset vietnamese riêng)
const figtree = Figtree({ subsets: ["latin", "latin-ext"], variable: "--font-sans", display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap", preload: false });

/** Chỉ sinh các ngôn ngữ đã khai báo; đường dẫn lạ -> 404 */
export const dynamicParams = false;
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return constructMetadata({ locale, path: "/" });
}

export default async function LandingLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const content = getContent(locale);
  const { meta, ui } = content.shared;

  // Dữ liệu có cấu trúc: Person + WebSite (giúp Google hiểu chủ sở hữu và tên trang)
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Nguyễn Đăng Phát",
      alternateName: "ERICSS",
      url: absoluteUrl(locale),
      image: new URL("/images/avatar.webp", siteConfig.url).toString(),
      jobTitle: meta.jobTitle,
      description: meta.description,
      email: `mailto:${siteConfig.email}`,
      sameAs: [siteConfig.links.github, siteConfig.links.linkedin, siteConfig.links.facebook],
      knowsAbout: meta.keywords,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: meta.siteName,
      url: absoluteUrl(locale),
      inLanguage: locale,
    },
  ];

  return (
    <html lang={locale} className={cn("font-sans", figtree.variable)} suppressHydrationWarning>
      <body className={`${geistMono.variable} antialiased overflow-x-hidden`}>
        <ThemeProvider>
          <LandingProvider content={content}>
            <a
              href="#main-content"
              className="sr-only z-[200] rounded-md bg-foreground px-4 py-2 text-background focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
            >
              {ui.skipToContent}
            </a>
            <Preloader />
            <PageBackground>
              <div className="flex min-h-screen flex-col">
                <SubpageHeader />
                <main id="main-content" className="flex-1">{children}</main>
                <ContactSection />
                <Footer />
              </div>
            </PageBackground>
            <SharedDock />
            <Toaster richColors position="bottom-right" />
          </LandingProvider>
        </ThemeProvider>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }} />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
