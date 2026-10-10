"use client";

import { motion } from "motion/react";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";

/** Hiệu ứng vào trang nhẹ (chỉ opacity + translate, GPU): không dùng blur/3D để giữ LCP và TBT thấp. */
export default function Template({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="h-full w-full"
    >
      {children}
    </motion.div>
  );
}
