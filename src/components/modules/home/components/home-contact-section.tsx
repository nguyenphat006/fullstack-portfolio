"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { HOME_CONTACT_CONTENT } from "../constants";

export function HomeContactSection() {
  return (
    <section id="lien-he" className="ds-section relative overflow-hidden lg:pl-20 pb-32">
      {/* Background glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          background:
            "radial-gradient(ellipse at 50% 80%, var(--cta-glow) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />

      <div className="ds-container relative z-10">
        <motion.div
          className="mx-auto max-w-3xl space-y-8 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="ds-badge">{HOME_CONTACT_CONTENT.badge}</span>
          <h2 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            <span className="ds-gradient-text">{HOME_CONTACT_CONTENT.headline}</span>
          </h2>
          <p className="mx-auto max-w-xl text-base text-[var(--color-text-muted)] md:text-lg">
            {HOME_CONTACT_CONTENT.subtext}
          </p>

          <motion.div
            className="flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Button asChild className="ds-btn-primary">
              <Link
                href={HOME_CONTACT_CONTENT.primaryCta.href}
                className="cursor-pointer"
              >
                {HOME_CONTACT_CONTENT.primaryCta.label}
                <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="ds-btn-secondary">
              <Link
                href={HOME_CONTACT_CONTENT.secondaryCta.href}
                className="cursor-pointer"
              >
                {HOME_CONTACT_CONTENT.secondaryCta.label}
              </Link>
            </Button>
          </motion.div>

          {/* Minimal copyright */}
          <motion.p
            className="pt-10 text-xs text-[var(--color-text-muted)]/50"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            © 2026 Nguyễn Phát
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
