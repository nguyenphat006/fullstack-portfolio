"use client";

import { motion } from "motion/react";
import { SectionHeader } from "@/components/shared/section-header";
import { shortSentence } from "@/lib/utils";
import { HOME_ABOUT_CONTENT } from "../constants";

export function HomeAboutSection() {
  const bio = HOME_ABOUT_CONTENT.bio[0]
    ? shortSentence(HOME_ABOUT_CONTENT.bio[0])
    : "";

  return (
    <section id="ve-toi" className="ds-section relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-[10%] top-10 h-36 w-36 rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="ds-container relative space-y-12">
        <SectionHeader
          badge={HOME_ABOUT_CONTENT.badge}
          title={HOME_ABOUT_CONTENT.title}
          description={bio}
        />

        <div className="mx-auto grid w-full max-w-4xl gap-6">
          <motion.div
            className="ds-card text-center"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-base leading-relaxed text-[var(--color-text-muted)] md:text-lg">
              {bio}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {HOME_ABOUT_CONTENT.values.map((value) => (
                <span key={value} className="ds-chip text-xs">
                  {value}
                </span>
              ))}
            </div>
            <a href={HOME_ABOUT_CONTENT.ctaHref} className="ds-btn-primary mt-6 inline-block">
              {HOME_ABOUT_CONTENT.ctaLabel}
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="ds-terminal">
              <div className="ds-terminal-bar">
                <div className="ds-terminal-dot" style={{ background: "#EF4444" }} />
                <div className="ds-terminal-dot" style={{ background: "#F59E0B" }} />
                <div className="ds-terminal-dot" style={{ background: "#22C55E" }} />
                <span className="ml-3 text-xs text-[var(--color-text-muted)]">
                  terminal — zsh
                </span>
              </div>
              <div className="ds-terminal-body">
                {HOME_ABOUT_CONTENT.terminalLines.map((line, i) => (
                  <motion.p
                    key={i}
                    className={`${
                      line.startsWith("$")
                        ? "text-[var(--color-cta)] font-semibold"
                        : "text-[var(--color-text-muted)]"
                    } ${i > 0 ? "mt-1.5" : ""}`}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.12, duration: 0.3 }}
                  >
                    {line}
                  </motion.p>
                ))}
                <span className="ds-cursor-blink mt-2" aria-hidden="true" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
