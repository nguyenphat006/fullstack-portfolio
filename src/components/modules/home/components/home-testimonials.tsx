"use client";

import { motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { QuoteDownIcon } from "@hugeicons/core-free-icons";
import { HOME_TESTIMONIALS } from "../constants";

export function HomeTestimonials() {
  return (
    <section className="ds-section lg:pl-20">
      <div className="ds-container space-y-10">
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <p className="ds-badge">Phản Hồi</p>
          <h2 className="text-3xl font-bold tracking-tight text-[var(--color-text)] md:text-4xl lg:text-5xl">
            Đánh Giá <span className="ds-gradient-text">Từ Đồng Nghiệp</span>
          </h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {HOME_TESTIMONIALS.map((item, i) => (
            <motion.article
              key={item.id}
              className="ds-glow-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              whileHover={{ y: -4 }}
            >
              <div className="flex h-full flex-col justify-between">
                <div>
                  <HugeiconsIcon
                    icon={QuoteDownIcon}
                    size={24}
                    className="mb-4 text-[var(--color-cta)] opacity-50"
                  />
                  <p className="text-sm leading-relaxed text-[var(--color-text-muted)] italic md:text-base">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-3 border-t border-border pt-4">
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
