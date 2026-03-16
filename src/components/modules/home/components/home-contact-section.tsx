"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/shared/section-header";
import { shortSentence } from "@/lib/utils";
import { HOME_CONTACT_CONTENT } from "../constants";

export function HomeContactSection() {
  const intro = shortSentence(HOME_CONTACT_CONTENT.subtext);

  return (
    <section id="lien-he" className="ds-section relative overflow-hidden pb-32">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            background:
              "radial-gradient(ellipse at 50% 80%, var(--cta-glow) 0%, transparent 60%)",
          }}
        />
        <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:64px_64px]" />
      </div>

      <div className="ds-container relative z-10 space-y-10">
        <SectionHeader
          badge={HOME_CONTACT_CONTENT.badge}
          title={HOME_CONTACT_CONTENT.headline}
          description={intro}
        />

        <motion.div
          className="flex flex-wrap justify-center gap-4"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Button asChild className="ds-btn-primary">
            <Link href={HOME_CONTACT_CONTENT.primaryCta.href} className="cursor-pointer">
              {HOME_CONTACT_CONTENT.primaryCta.label}
              <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="ml-2" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="ds-btn-secondary">
            <Link href={HOME_CONTACT_CONTENT.secondaryCta.href} className="cursor-pointer">
              {HOME_CONTACT_CONTENT.secondaryCta.label}
            </Link>
          </Button>
        </motion.div>

        <motion.p
          className="text-center text-xs text-[var(--color-text-muted)]/50"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          © 2026 Nguyễn Phát
        </motion.p>
      </div>
    </section>
  );
}
