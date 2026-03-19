"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export function Preloader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time (e.g., waiting for fonts/images to render nicely)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: "-100%" }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0E0E0E]"
        >
          {/* Animated Text Container */}
          <div className="relative flex w-full flex-col items-center justify-center overflow-hidden px-4 md:px-10 h-full">
             {/* Background Glows (Multi-color) */}
             <motion.div
               animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.4, 0.15] }}
               transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
               className="absolute top-1/4 left-1/4 h-[30vw] w-[30vw] rounded-full bg-purple-600 blur-[100px]"
             />
             <motion.div
               animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.3, 0.1] }}
               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
               className="absolute bottom-1/4 right-1/4 h-[25vw] w-[25vw] rounded-full bg-cyan-500 blur-[100px]"
             />
             <motion.div
               animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0.25, 0.1] }}
               transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
               className="absolute top-1/2 left-1/2 h-[20vw] w-[20vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500 blur-[100px]"
             />
             
             {/* Subtitle Role */}
             <motion.div
               initial={{ opacity: 0, y: -20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
               className="relative z-10 mb-2 md:mb-6 rounded-full border border-white/20 bg-white/5 px-4 md:px-6 py-2 backdrop-blur-md"
             >
                <p className="font-mono text-xs md:text-sm font-semibold uppercase tracking-[0.3em] text-white/90">
                  Software Engineer
                </p>
             </motion.div>

             {/* Text Masked Glow - Massive Fullscreen Size */}
             <motion.h1
               initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
               animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
               transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
               className="relative z-10 text-center font-black uppercase tracking-tight leading-none text-[22vw] sm:text-[20vw] md:text-[18vw] lg:text-[15vw] bg-gradient-to-br from-cyan-300 via-emerald-400 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
             >
               ERICSS
             </motion.h1>

             {/* Progress Line */}
             <motion.div
               initial={{ scaleX: 0 }}
               animate={{ scaleX: 1 }}
               transition={{ duration: 2.5, ease: "easeInOut" }}
               className="relative z-10 mt-8 md:mt-12 h-[2px] w-[200px] md:w-[300px] lg:w-[400px] overflow-hidden rounded-full bg-white/10 origin-left"
             >
               <div className="h-full w-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-500" />
             </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
