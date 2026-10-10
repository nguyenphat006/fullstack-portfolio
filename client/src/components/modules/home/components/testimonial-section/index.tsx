"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useLanding } from "@/content/provider";
import type { HomeTestimonial } from "../../types";

export function HomeTestimonialsSection() {
  const { home } = useLanding();
  const HOME_TESTIMONIALS = home.testimonials;
  const t = home.ui.testimonials;
  return (
    <section id="nhan-xet" className="ds-section relative overflow-hidden py-16">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute right-[12%] top-6 h-64 w-64 rounded-full bg-[var(--color-cta)]/5 blur-[100px]" />
      </div>

      <div className="ds-container relative space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">{t.title} <span className="text-[var(--color-cta)]">{t.accent}</span></h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">{t.description}</p>
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
                className="relative flex w-[280px] md:w-[350px] shrink-0 flex-col justify-between rounded-2xl bg-secondary/30 border border-border p-6 shadow-xl backdrop-blur-md transition-colors hover:bg-secondary/50 group overflow-hidden"
              >
                {/* Background Watermark Logo */}
                <div className="absolute inset-0 z-0 opacity-10 pointer-events-none group-hover:opacity-30 transition-opacity duration-300">
                  <Image
                    src={testimonial.avatar}
                    alt=""
                    fill
                    sizes="350px"
                    className="object-contain p-8 scale-90 grayscale group-hover:grayscale-0 transition-all duration-300"
                  />
                </div>

                <div className="relative z-10 flex flex-col h-full gap-6">
                  <p className="text-foreground/75 leading-relaxed italic text-sm font-light">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>

                  <div className="mt-auto flex items-center gap-4 pt-6 border-t border-border">
                    <div className="space-y-1">
                      <h3 className="font-bold text-foreground text-base">{testimonial.name}</h3>
                      <p className="text-xs font-semibold tracking-wide text-[var(--color-cta)]">
                        {testimonial.role} <span className="text-muted-foreground font-normal ml-1">@ {testimonial.company}</span>
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
