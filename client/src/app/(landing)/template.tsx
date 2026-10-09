"use client";

import { motion } from "motion/react";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div style={{ perspective: "2500px" }} className="w-full h-full">
      <motion.div
        key={pathname}
        initial={{
          rotateY: -90,
          opacity: 0,
          scale: 0.9,
          z: -300,
          filter: "blur(20px)"
        }}
        animate={{
          rotateY: 0,
          opacity: 1,
          scale: 1,
          z: 0,
          filter: "blur(0px)"
        }}
        transition={{
          duration: 1.2,
          ease: [0.16, 1, 0.3, 1] // Custom spring-like easing function for premium feel
        }}
        style={{
          transformOrigin: "left center",
          transformStyle: "preserve-3d",
        }}
        className="w-full h-full p-0 m-0"
      >
        {children}
      </motion.div>
    </div>
  );
}
