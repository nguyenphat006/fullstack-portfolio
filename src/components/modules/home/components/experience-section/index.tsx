"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { SectionHeader } from "@/components/shared/section-header";
import { HOME_EXPERIENCES } from "../../constants";
import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChevronRight, ExternalLink } from "lucide-react";
import { ExperienceModal } from "./experience-modal";

export function HomeExperienceSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedId) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedId]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const pathLength = useTransform(scrollYProgress, [0.2, 0.8], [0, 1]);

  return (
    <section id="kinh-nghiem" className="ds-section relative overflow-hidden">
      {/* Background Glow */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-[30%] top-20 h-64 w-64 rounded-full bg-[var(--color-cta)]/5 blur-[100px]" />
      </div>

      <div className="ds-container relative space-y-24">
        <SectionHeader
          badge="Kinh Nghiệm"
          title="Hành Trình"
          accent="Phát Triển"
          description="Những điểm chạm quan trọng định hình kỹ năng và tư duy sản phẩm của tôi."
        />

        <div ref={containerRef} className="relative w-full">
          {/* Timeline Center Line (Horizontal) Desktop */}
          <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 bg-white/5 hidden md:block overflow-hidden">
            {/* Scroll Fill */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-[var(--color-cta)] to-purple-500/50"
              style={{ scaleX: pathLength, transformOrigin: "left" }}
            />
            {/* Infinite Light Beam */}
            <motion.div
              className="absolute inset-y-0 w-[150px] bg-gradient-to-r from-transparent via-white/80 to-transparent"
              animate={{ x: ["-150px", "100vw"] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: "linear" }}
            />
          </div>

          {/* Timeline Center Line (Vertical) Mobile */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-white/5 md:hidden block overflow-hidden">
            {/* Scroll Fill */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-b from-[var(--color-cta)] to-purple-500/50"
              style={{ scaleY: pathLength, transformOrigin: "top" }}
            />
            {/* Infinite Light Beam */}
            <motion.div
              className="absolute inset-x-0 h-[150px] bg-gradient-to-b from-transparent via-white/80 to-transparent"
              animate={{ y: ["-150px", "100vh"] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: "linear" }}
            />
          </div>

          <div className="flex flex-col gap-12 md:flex-row md:items-center md:justify-center md:gap-8 lg:gap-16">
            {HOME_EXPERIENCES.map((item, i) => {
              const isEven = i % 2 === 0;

              return (
                <motion.article
                  key={item.id}
                  className={cn(
                    "relative flex flex-col md:w-[320px] lg:w-[380px] shrink-0",
                    isEven ? "md:mb-[280px]" : "md:mt-[280px]",
                    "pl-16 md:pl-0" // mobile padding for vertical line
                  )}
                  initial={{ opacity: 0, y: isEven ? 50 : -50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: i * 0.2, duration: 0.6, type: "spring" }}
                >
                  {/* Desktop Timeline Dot & Branch */}
                  <div className="hidden md:block absolute left-1/2 w-0.5 bg-gradient-to-b from-white/20 to-transparent"
                    style={{
                      height: '140px',
                      top: isEven ? '100%' : 'auto',
                      bottom: isEven ? 'auto' : '100%',
                      transform: 'translateX(-50%)',
                      background: isEven ? 'linear-gradient(to bottom, rgba(255,255,255,0.2), transparent)' : 'linear-gradient(to top, rgba(255,255,255,0.2), transparent)'
                    }}
                  />
                  <div className={cn(
                    "hidden md:block absolute left-1/2 h-4 w-4 -translate-x-1/2 rounded-full border-4 border-[#1C1816] shadow-[0_0_15px_var(--color-cta-glow)]",
                    isEven ? "top-[calc(100%+140px)] -translate-y-1/2" : "bottom-[calc(100%+140px)] translate-y-1/2",
                    i === 0 ? "bg-[var(--color-cta)]" : "bg-white/50"
                  )} />

                  {/* Mobile Timeline Dot & Branch */}
                  <div className="md:hidden absolute left-6 top-8 h-px bg-gradient-to-r from-white/20 to-transparent w-10 -translate-x-[calc(100%-12px)]" />
                  <div className={cn(
                    "md:hidden absolute left-6 top-8 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-[#1C1816] shadow-[0_0_15px_var(--color-cta-glow)]",
                    i === 0 ? "bg-[var(--color-cta)]" : "bg-white/50"
                  )} />

                  {/* Card Content */}
                  <div className="ds-glow-card relative z-10 w-full overflow-hidden bg-black/40 backdrop-blur-xl border border-white/5 transition-all duration-500 hover:-translate-y-2 hover:border-[var(--color-cta)]/30 hover:bg-[var(--color-cta)]/5 group p-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-cta)]/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                    <div className="flex flex-col gap-6 relative z-10 p-6 md:p-8">
                      {/* Top Header Region: Period & Location */}
                      <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <span className="rounded-full bg-[var(--color-cta)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#B5915F]">
                          {item.period}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs tracking-wider uppercase font-medium text-white/40">{item.location}</span>
                        </div>
                      </div>

                      {/* Logo Region */}
                      <div className="flex flex-col items-center justify-center pt-2">
                        <div className={cn(
                          "relative object-contain shrink-0",
                          item.id === "exp-1" ? "h-20 w-48" : // NPH Digital much larger
                            item.id === "exp-2" ? "h-16 w-48" : // Hinova large
                              "h-16 w-32" // Default
                        )}>
                          <Image src={item.logo} alt={item.company} fill className="object-contain" />
                        </div>
                      </div>

                      {/* Title Region (Centered) */}
                      <div className="text-center pt-2 pb-4 border-b border-white/5">
                        <h3 className="text-2xl font-black uppercase tracking-[0.15em] text-white/90 leading-tight mb-2">{item.company}</h3>
                        <p className="text-base font-medium text-[var(--color-cta)]">{item.role}</p>
                      </div>

                      {/* Content Region (Left Aligned for readability) */}
                      <div className="space-y-5 text-left">
                        {item.description && (
                          <p className="text-sm text-white/60 leading-relaxed font-light">{item.description}</p>
                        )}

                        {/* Actions: View Details (Modal) & External Website (Inline Link) */}
                        <div className="flex items-center justify-between pt-2">
                          <button
                            onClick={() => setSelectedId(item.id)}
                            className="group/btn flex items-center gap-2 text-sm font-medium text-[var(--color-cta)] transition-colors hover:text-white"
                          >
                            <span>Xem chi tiết</span>
                            <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                          </button>

                          {item.websiteUrl && (
                            <a
                              href={item.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group/link flex items-center gap-1.5 text-xs font-medium text-white/40 transition-colors hover:text-white/80"
                            >
                              <span className="relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-white/40 after:transition-all group-hover/link:after:w-full">Website</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>

      {/* Details Modal */}
      <ExperienceModal selectedId={selectedId} onClose={() => setSelectedId(null)} />
    </section>
  );
}
