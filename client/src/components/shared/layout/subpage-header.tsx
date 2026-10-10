"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, useScroll, useMotionValueEvent } from "motion/react";
import { Home, ChevronRight } from "lucide-react";
import { Fragment, useState } from "react";
import { stripLocale } from "@/content/locales";
import { useLanding } from "@/content/provider";

export function SubpageHeader() {
  const pathname = usePathname();
  const { shared, project, blog, path } = useLanding();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);

  const barePath = stripLocale(pathname);
  // Từng đoạn segment từ URL (không gồm tiền tố ngôn ngữ), vd: /projects/shopsifu => ["projects", "shopsifu"]
  const segments = barePath.split("/").filter(Boolean);

  const getSegmentName = (segment: string, index: number) => {
    if (index === 0 && shared.ui.breadcrumb[segment]) return shared.ui.breadcrumb[segment];
    if (index === 1 && segments[0] === "projects") return project.items.find((p) => p.id === segment)?.title ?? segment;
    if (index === 1 && segments[0] === "blog") return blog.posts.find((p) => p.slug === segment)?.title ?? segment;
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    // Ẩn header khi cuộn xuống, hiện lại khi cuộn lên
    setHidden(latest > previous && latest > 100);
  });

  if (barePath === "/") return null;

  return (
    <motion.header
      variants={{ visible: { y: 0, opacity: 1 }, hidden: { y: "-100%", opacity: 0 } }}
      initial="visible"
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="fixed left-0 right-0 top-0 z-50 w-full border-b border-foreground/10 bg-[var(--surface-glass)] backdrop-blur-xl"
    >
      <div className="ds-container flex h-14 items-center md:h-16">
        <nav aria-label="Breadcrumb" className="scrollbar-hide flex w-full max-w-full items-center overflow-x-auto whitespace-nowrap text-xs font-medium md:text-sm">
          <Link href={path("/")} className="flex shrink-0 items-center gap-1.5 text-foreground/70 transition-colors hover:text-[var(--color-cta)]">
            <Home size={16} aria-hidden />
            <span className="hidden sm:inline">{shared.ui.home}</span>
            <span className="sr-only sm:hidden">{shared.ui.home}</span>
          </Link>

          {segments.map((segment, index) => {
            const segPath = "/" + segments.slice(0, index + 1).join("/");
            const isLast = index === segments.length - 1;
            const name = getSegmentName(segment, index);

            return (
              <Fragment key={segPath}>
                <ChevronRight size={16} className="mx-2 shrink-0 text-foreground/30 md:mx-3" aria-hidden />
                {isLast ? (
                  <span aria-current="page" className="max-w-[200px] shrink-0 truncate font-bold text-[var(--color-cta)] md:max-w-none">
                    {name}
                  </span>
                ) : (
                  <Link href={path(segPath)} className="shrink-0 text-foreground/70 transition-colors hover:text-foreground">
                    {name}
                  </Link>
                )}
              </Fragment>
            );
          })}
        </nav>
      </div>
    </motion.header>
  );
}
