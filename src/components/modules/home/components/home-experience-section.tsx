"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { SectionHeader } from "@/components/shared/section-header";
import { HOME_EXPERIENCES } from "../constants";

export function HomeExperienceSection() {
  return (
    <section id="kinh-nghiem" className="ds-section relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-[15%] top-8 h-32 w-32 rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="ds-container relative space-y-12">
        <SectionHeader
          badge="Work Experience"
          title="Hành Trình"
          accent="Làm Việc"
          description="Các điểm chạm quan trọng trong hành trình sản phẩm và đội ngũ."
        />

        <div className="relative">
          <div className="absolute left-0 right-0 top-10 h-px bg-border" />
          <div className="flex gap-6 overflow-x-auto pb-6 pt-4 snap-x snap-mandatory">
            {HOME_EXPERIENCES.map((item, i) => (
              <motion.article
                key={item.id}
                className="ds-glow-card relative min-w-[260px] snap-start sm:min-w-[320px]"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <div className="absolute -top-3 left-8 h-3 w-3 rounded-full bg-[var(--color-cta)] shadow-[0_0_12px_var(--color-cta-glow)]" />
                <div className="flex items-center gap-4">
                  <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-border bg-card">
                    <Image src={item.logo} alt={item.company} fill className="object-cover" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                      {item.period}
                    </p>
                    <h3 className="text-lg font-semibold text-white">{item.company}</h3>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-4">
                  <p className="text-sm text-white/80">{item.role}</p>
                  <span className="text-xs text-white/40">{item.location}</span>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
