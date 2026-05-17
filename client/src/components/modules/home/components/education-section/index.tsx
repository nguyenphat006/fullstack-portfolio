"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { SectionHeader } from "@/components/shared/section-header";
import { HOME_EDUCATION } from "../../constants";

export function HomeEducationSection() {
  return (
    <section id="hoc-van" className="ds-section relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute right-[15%] top-8 h-32 w-32 rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="ds-container relative space-y-12">
        <SectionHeader
          badge="Education"
          title="Học Vấn"
          accent="& Chứng Chỉ"
          description="Nền tảng học thuật và các chương trình tăng tốc chuyên môn."
        />

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
          {HOME_EDUCATION.map((item, i) => (
            <motion.article
              key={item.id}
              className="group relative overflow-hidden rounded-3xl bg-[#171717] p-[1.5px] shadow-2xl"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
            >
              {/* Colorful Animated Border / Glow Behind */}
              <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500 opacity-20 group-hover:opacity-50 transition-opacity duration-700" />
              
              {/* Inner Card (Glassmorphism Shell) */}
              <div className="relative flex h-full flex-col bg-black/80 backdrop-blur-2xl p-8 rounded-[22px] overflow-hidden">
                 {/* Decorative Mesh Blobs */}
                 <div className="absolute -right-20 -top-20 h-48 w-48 bg-fuchsia-500/20 blur-[60px] rounded-full group-hover:bg-fuchsia-500/40 transition-colors duration-700" />
                 <div className="absolute -left-20 -bottom-20 h-48 w-48 bg-indigo-500/20 blur-[60px] rounded-full group-hover:bg-indigo-500/40 transition-colors duration-700" />
                 
                 <div className="relative z-10 flex items-start justify-between mb-10">
                   <div className="relative h-20 w-32 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-3 shadow-xl backdrop-blur-sm group-hover:border-white/20 transition-colors">
                     <Image src={item.logo} alt={item.school} fill className="object-contain p-2" />
                   </div>
                   <div className="flex flex-col items-end">
                     <span className="rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-bold tracking-widest text-emerald-400 uppercase border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                       {item.period}
                     </span>
                   </div>
                 </div>

                 <div className="relative z-10 mt-auto">
                   <p className="text-lg font-medium text-[var(--color-cta)] mb-2">
                     {item.degree}
                   </p>
                   <h3 className="text-3xl lg:text-4xl font-black text-white mb-8 leading-tight group-hover:bg-gradient-to-r group-hover:from-fuchsia-400 group-hover:via-purple-400 group-hover:to-indigo-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                     {item.school}
                   </h3>
                   
                   <div className="flex items-center justify-between pt-6 border-t border-white/10">
                     <span className="text-sm font-mono tracking-widest text-white/40 uppercase">
                       {item.location}
                     </span>
                     <div className="h-8 w-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center group-hover:bg-[var(--color-cta)] group-hover:border-[var(--color-cta)] transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                          <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                     </div>
                   </div>
                 </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
