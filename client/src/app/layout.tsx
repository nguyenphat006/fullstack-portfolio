import { Geist, Geist_Mono, Figtree } from "next/font/google";
import { constructMetadata } from "@/config/site";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SharedDock } from "@/components/shared/layout/shared-dock";
import { Footer } from "@/components/shared/layout/footer";
import { PageBackground } from "@/components/shared/layout/page-background";
import { SubpageHeader } from "@/components/shared/layout/subpage-header";
import { HomeContactSection as ContactSection } from "@/components/shared/layout/contact-section";
import { Toaster } from "@/components/ui/sonner";
import { Preloader } from "@/components/shared/layout/preloader";

const figtree = Figtree({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = constructMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", figtree.variable)}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased text-white overflow-x-hidden`}
      >
        <Preloader />
        <PageBackground>
          <div className="flex min-h-screen flex-col">
            <SubpageHeader />
            <div className="flex-1">{children}</div>
            <ContactSection />
            <Footer />
          </div>
        </PageBackground>
        <SharedDock />
        <Toaster richColors position="bottom-right" />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
