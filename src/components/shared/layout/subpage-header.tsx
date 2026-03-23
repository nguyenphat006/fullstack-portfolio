"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
  "/blog": "Bài Viết",
  "/projects": "Dự Án",
};

export function SubpageHeader() {
  const pathname = usePathname();
  
  if (pathname === "/") return null;

  const title = PAGE_TITLES[pathname] || "Trang Phụ";

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/50 backdrop-blur-md"
    >
      <div className="ds-container flex h-16 items-center justify-between">
        <Link 
          href="/"
          className="group flex items-center gap-2 text-sm font-medium text-white/70 transition-colors hover:text-white"
        >
          <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
          Quay lại Trang chủ
        </Link>
        <div className="text-sm font-bold text-white uppercase tracking-wider">
          {title}
        </div>
      </div>
    </motion.header>
  );
}
