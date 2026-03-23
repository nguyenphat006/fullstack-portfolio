"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Quote } from "lucide-react";
import { SectionHeader } from "@/components/shared/section-header";
import { HOME_TESTIMONIALS } from "../../constants";
import type { HomeTestimonial } from "../../types";

export function HomeTestimonialsSection() {
  return (
    <section id="nhan-xet" className="ds-section relative overflow-hidden py-16">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute right-[12%] top-6 h-64 w-64 rounded-full bg-[var(--color-cta)]/5 blur-[100px]" />
      </div>

      <div className="ds-container relative space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Đồng Nghiệp <span className="text-[var(--color-cta)]">Đánh Giá</span></h2>
          <p className="text-sm text-white/50 max-w-xl mx-auto">Những nhận xét khách quan từ quản lý và đồng nghiệp đã làm việc trực tiếp cùng tôi.</p>
        </div>

        <div className="relative flex w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <motion.div
            className="flex w-max shrink-0 gap-8 py-4"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              duration: 30, // Smooth infinite scroll speed
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {[...HOME_TESTIMONIALS, ...HOME_TESTIMONIALS].map((testimonial: HomeTestimonial, i: number) => (
              <div
                key={`${testimonial.id}-${i}`}
                className="relative flex w-[280px] md:w-[350px] shrink-0 flex-col justify-between rounded-2xl bg-secondary/30 border border-white/5 p-6 shadow-xl backdrop-blur-md transition-colors hover:bg-secondary/50 group overflow-hidden"
              >
                {/* Background Watermark Logo */}
                <div className="absolute inset-0 z-0 opacity-10 pointer-events-none group-hover:opacity-30 transition-opacity duration-300">
                  <Image
                    src={testimonial.avatar}
                    alt={`${testimonial.company} watermark`}
                    fill
                    className="object-contain p-8 scale-90 grayscale group-hover:grayscale-0 transition-all duration-300"
                  />
                </div>

                <div className="relative z-10 flex flex-col h-full gap-6">
                  <p className="text-white/70 leading-relaxed italic text-sm font-light">
                    "{testimonial.content}"
                  </p>

                  <div className="mt-auto flex items-center gap-4 pt-6 border-t border-white/5">
                    <div className="space-y-1">
                      <h4 className="font-bold text-white text-base">{testimonial.name}</h4>
                      <p className="text-xs font-semibold tracking-wide text-[var(--color-cta)]">
                        {testimonial.role} <span className="text-white/40 font-normal ml-1">@ {testimonial.company}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
