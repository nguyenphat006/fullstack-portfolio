"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { HOME_HERO_CONTENT, HOME_HERO_STATS } from "../constants";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const },
  }),
};

export function HomeHeroSection() {
  const shortSubtext = (() => {
    const firstSentence = HOME_HERO_CONTENT.subtext.split(".")[0]?.trim();
    if (firstSentence && firstSentence.length >= 20) {
      return `${firstSentence}.`;
    }
    return HOME_HERO_CONTENT.subtext;
  })();

  return (
    <section id="trang-chu" className="relative min-h-screen overflow-hidden">
      {/* Ambient layers */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-[-20%] right-[8%] h-72 w-72 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:64px_64px]" />
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 text-[18vw] font-bold tracking-tight text-white/5">
          PORTFOLIO
        </div>
      </div>

      <div className="ds-container relative flex min-h-screen items-center py-24">
        <div className="mx-auto w-full max-w-4xl text-center">
          <motion.span
            className="ds-badge"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {HOME_HERO_CONTENT.badge}
          </motion.span>

          <motion.div
            className="mx-auto mt-6 max-w-3xl space-y-4"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
          >
            <div className="mx-auto flex w-fit items-center gap-4 rounded-full border border-border bg-card/60 px-4 py-2 backdrop-blur">
              <div className="relative h-10 w-10 overflow-hidden rounded-full border border-border">
                <Image
                  src="/images/avatar.png"
                  alt="Nguyễn Đăng Phát Fullstack Developer"
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                  priority
                />
              </div>
              <div className="text-left text-sm">
                <p className="font-semibold text-white">ERICSS</p>
                <p className="text-white/50">Fullstack Developer</p>
              </div>
            </div>

            <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              {HOME_HERO_CONTENT.headline}
            </h1>
            <p className="mx-auto max-w-2xl text-base leading-relaxed text-white/55 md:text-lg">
              {shortSubtext}
            </p>
          </motion.div>

          <motion.div
            className="mt-8 flex flex-wrap justify-center gap-4"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
          >
            <Button asChild className="ds-btn-primary">
              <Link href={HOME_HERO_CONTENT.primaryCta.href} className="cursor-pointer">
                {HOME_HERO_CONTENT.primaryCta.label}
                <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="ds-btn-secondary">
              <Link href={HOME_HERO_CONTENT.secondaryCta.href} className="cursor-pointer">
                {HOME_HERO_CONTENT.secondaryCta.label}
              </Link>
            </Button>
          </motion.div>

          <motion.div
            className="mt-10 flex flex-wrap justify-center gap-8"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={3}
          >
            {HOME_HERO_STATS.map((item) => (
              <div key={item.id} className="space-y-1 text-center">
                <p className="text-2xl font-bold text-white md:text-3xl">{item.value}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                  {item.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
