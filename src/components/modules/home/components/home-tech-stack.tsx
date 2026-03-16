"use client";

import { motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CodeCircleIcon,
  Briefcase07Icon,
  BookOpen01Icon,
} from "@hugeicons/core-free-icons";
import { HOME_TECH_STACK } from "../constants";

const iconMap: Record<string, typeof CodeCircleIcon> = {
  CodeCircleIcon,
  Briefcase07Icon,
  BookOpen01Icon,
};

function AnimatedBar({ level, delay }: { level: number; delay: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          className="h-1.5 w-4 rounded-full"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ delay: delay + i * 0.05, duration: 0.3 }}
          style={{
            background: i < level ? "var(--cta)" : "var(--border)",
            transformOrigin: "left",
          }}
        />
      ))}
    </div>
  );
}

export function HomeTechStack() {
  return (
    <section id="cong-nghe" className="ds-section lg:pl-20">
      <div className="ds-container space-y-10">
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <p className="ds-badge">Công Nghệ</p>
          <h2 className="text-3xl font-bold tracking-tight text-[var(--color-text)] md:text-4xl lg:text-5xl">
            Stack <span className="ds-gradient-text">Kỹ Thuật</span>
          </h2>
          <p className="max-w-3xl text-base text-[var(--color-text-muted)] md:text-lg">
            Các công nghệ và công cụ tôi sử dụng hàng ngày để xây dựng sản phẩm chất lượng.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {HOME_TECH_STACK.map((category, catIdx) => (
            <motion.div
              key={category.id}
              className="ds-glow-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: catIdx * 0.15, duration: 0.5 }}
            >
              <div className="mb-5 flex items-center gap-3">
                <span className="inline-flex items-center justify-center rounded-xl bg-[var(--color-secondary)]/60 p-2.5 text-[var(--color-cta)]">
                  <HugeiconsIcon
                    icon={iconMap[category.iconName] || CodeCircleIcon}
                    size={20}
                  />
                </span>
                <h3 className="text-lg font-semibold text-[var(--color-text)]">
                  {category.title}
                </h3>
              </div>

              <div className="space-y-3">
                {category.items.map((item, itemIdx) => (
                  <motion.div
                    key={item.name}
                    className="ds-tech-item"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: catIdx * 0.1 + itemIdx * 0.05, duration: 0.3 }}
                  >
                    <span className="flex-1 text-sm text-[var(--color-text)]">
                      {item.name}
                    </span>
                    <AnimatedBar level={item.level} delay={catIdx * 0.1 + itemIdx * 0.05} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
