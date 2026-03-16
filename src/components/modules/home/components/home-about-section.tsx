"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { HOME_ABOUT_CONTENT } from "../constants";

export function HomeAboutSection() {
  return (
    <section id="ve-toi" className="ds-section lg:pl-20">
      <div className="ds-container">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left: Text */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <span className="ds-badge">{HOME_ABOUT_CONTENT.badge}</span>
            <h2 className="text-3xl font-bold tracking-tight text-[var(--color-text)] md:text-4xl lg:text-5xl">
              {HOME_ABOUT_CONTENT.title}
            </h2>

            <div className="space-y-3">
              {HOME_ABOUT_CONTENT.bio.map((paragraph, i) => (
                <p
                  key={i}
                  className="text-base leading-relaxed text-[var(--color-text-muted)] md:text-lg"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            <ul className="space-y-3">
              {HOME_ABOUT_CONTENT.values.map((value, i) => (
                <motion.li
                  key={value}
                  className="ds-list-item text-sm text-[var(--color-text-muted)] md:text-base"
                  initial={{ opacity: 0, x: -15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.08, duration: 0.4 }}
                >
                  {value}
                </motion.li>
              ))}
            </ul>

            <a href={HOME_ABOUT_CONTENT.ctaHref} className="ds-btn-primary inline-block">
              {HOME_ABOUT_CONTENT.ctaLabel}
            </a>
          </motion.div>

          {/* Right: Terminal Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: 0.2, duration: 0.6 }}
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
                    transition={{ delay: 0.3 + i * 0.12, duration: 0.3 }}
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
