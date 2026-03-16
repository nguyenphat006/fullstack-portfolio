"use client";

import { motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { QuoteDownIcon } from "@hugeicons/core-free-icons";
import { SectionHeader } from "@/components/shared/section-header";
import { shortSentence } from "@/lib/utils";
import { HOME_TESTIMONIALS } from "../constants";

export function HomeTestimonials() {
  return (
    <section className="ds-section relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute right-[12%] top-6 h-36 w-36 rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="ds-container relative space-y-12">
        <SectionHeader badge="Phản Hồi" title="Đánh Giá" accent="Từ Đồng Nghiệp" />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {HOME_TESTIMONIALS.map((item, i) => (
            <motion.article
              key={item.id}
              className="ds-glow-card text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              whileHover={{ y: -4 }}
            >
              <div className="flex h-full flex-col justify-between gap-6">
                <div className="space-y-4">
                  <HugeiconsIcon
                    icon={QuoteDownIcon}
                    size={24}
                    className="mx-auto text-[var(--color-cta)] opacity-50"
                  />
                  <p className="text-sm leading-relaxed text-[var(--color-text-muted)] italic md:text-base">
                    &ldquo;{shortSentence(item.quote)}&rdquo;
                  </p>
                </div>

                <div className="flex flex-col items-center gap-2 border-t border-border pt-4">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{
                      background: "linear-gradient(135deg, var(--cta), var(--accent-earth))",
                    }}
                  >
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text)]">
                      {item.name}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {item.role} · {item.company}
                    </p>
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
