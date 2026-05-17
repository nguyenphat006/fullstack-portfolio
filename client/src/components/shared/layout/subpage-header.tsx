"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, useScroll, useMotionValueEvent } from "motion/react";
import { Home, ChevronRight } from "lucide-react";
import { PROJECTS_DATA } from "@/config/projects";
import { Fragment, useState } from "react";

const ROUTE_LABELS: Record<string, string> = {
  "blog": "Bài Viết",
  "projects": "Dự Án",
};

export function SubpageHeader() {
  const pathname = usePathname();

  if (pathname === "/") return null;

  // Lấy từng đoạn segment từ URL, vd: /projects/shopsifu => ["projects", "shopsifu"]
  const segments = pathname.split("/").filter(Boolean);

  const getSegmentName = (segment: string, index: number) => {
    if (index === 0 && ROUTE_LABELS[segment]) {
      return ROUTE_LABELS[segment];
    }
    if (index === 1 && segments[0] === "projects") {
      const project = PROJECTS_DATA.find(p => p.id === segment);
      return project ? project.title : segment;
    }
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    // Tự động dấu Header khi cuộn xuống và lộ ra khi cuộn lên
    if (latest > previous && latest > 100) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  return (
    <motion.header
      variants={{
        visible: { y: 0, opacity: 1 },
        hidden: { y: "-100%", opacity: 0 }
      }}
      initial="visible"
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="fixed top-0 left-0 right-0 z-50 w-full border-b border-white/10 bg-[#0E0E0E]/80 backdrop-blur-xl"
    >
      <div className="ds-container flex h-14 md:h-16 items-center">
        <nav className="flex items-center text-xs md:text-sm font-medium overflow-x-auto whitespace-nowrap scrollbar-hide w-full max-w-full">
          {/* Nút Về Trang chủ (Gốc) */}
          <Link
            href="/"
            className="flex items-center gap-1.5 text-white/50 hover:text-[var(--color-cta)] transition-colors shrink-0"
          >
            <Home size={16} />
            <span className="hidden sm:inline">Trang chủ</span>
          </Link>

          {/* Dây leo cấu trúc Breadcrumb đệ quy */}
          {segments.map((segment, index) => {
            const path = "/" + segments.slice(0, index + 1).join("/");
            const isLast = index === segments.length - 1;
            const name = getSegmentName(segment, index);

            return (
              <Fragment key={path}>
                <ChevronRight size={16} className="mx-2 md:mx-3 text-white/20 shrink-0" />
                {isLast ? (
                  <span className="text-[var(--color-cta)] font-bold truncate max-w-[200px] md:max-w-none shrink-0">
                    {name}
                  </span>
                ) : (
                  <Link
                    href={path}
                    className="text-white/70 hover:text-white transition-colors shrink-0"
                  >
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
