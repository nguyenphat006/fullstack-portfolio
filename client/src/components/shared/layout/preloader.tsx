"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const SEEN_KEY = "landing-preloader-seen";
const DURATION_MS = 1200;

/** Màn hình chào: chỉ hiện ở lần vào đầu tiên của phiên, ngắn để không làm chậm LCP. */
export function Preloader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      // sessionStorage bị chặn -> vẫn hiện bình thường
    }
    const timer = setTimeout(() => setIsLoading(false), seen ? 0 : DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="preloader"
          aria-hidden="true"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
          className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-background"
        >
          <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden px-4 md:px-10">
            <div className="absolute left-1/4 top-1/4 h-[30vw] w-[30vw] rounded-full bg-[radial-gradient(closest-side,rgba(147,51,234,0.25),transparent)]" />
            <div className="absolute bottom-1/4 right-1/4 h-[25vw] w-[25vw] rounded-full bg-[radial-gradient(closest-side,rgba(6,182,212,0.25),transparent)]" />

            {/* initial={false}: vẽ ngay từ HTML của server (không opacity 0) để LCP không phải chờ hydrate */}
            <motion.p
              initial={false}
              className="relative z-10 mb-2 rounded-full border border-foreground/20 bg-foreground/5 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.3em] text-foreground/80 md:mb-6 md:px-6 md:text-sm"
            >
              Software Engineer
            </motion.p>

            <motion.div
              initial={false}
              className="relative z-10 bg-gradient-to-br from-cyan-600 via-emerald-600 to-purple-600 bg-clip-text text-center text-[22vw] font-black uppercase leading-none tracking-tight text-transparent dark:from-cyan-300 dark:via-emerald-400 dark:to-purple-500 sm:text-[20vw] md:text-[18vw] lg:text-[15vw]"
            >
              ERICSS
            </motion.div>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: DURATION_MS / 1000, ease: "easeInOut" }}
              className="relative z-10 mt-8 h-[2px] w-[200px] origin-left overflow-hidden rounded-full bg-foreground/10 md:mt-12 md:w-[300px] lg:w-[400px]"
            >
              <div className="h-full w-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-500" />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
