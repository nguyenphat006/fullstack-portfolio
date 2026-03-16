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
  return (
    <section id="trang-chu" className="relative min-h-screen overflow-hidden flex items-center">
      {/* Subtle floating glow */}
      <div
        className="ds-float-slow pointer-events-none absolute top-20 left-10 h-40 w-40 rounded-full opacity-5"
        style={{ background: "radial-gradient(circle, #fff, transparent)" }}
        aria-hidden="true"
      />

      <div className="ds-container py-20 lg:pl-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left: Content */}
          <div className="space-y-8">
            <motion.span
              className="ds-badge"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {HOME_HERO_CONTENT.badge}
            </motion.span>

            <motion.div
              className="space-y-4"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={1}
            >
              <h1 className="text-4xl leading-tight font-bold tracking-tight md:text-5xl lg:text-6xl">
                {HOME_HERO_CONTENT.headline}
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-white/50 md:text-lg">
                {HOME_HERO_CONTENT.subtext}
              </p>
            </motion.div>

            <motion.div
              className="flex flex-wrap gap-4"
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

            {/* Stats — inline, no cards */}
            <motion.div
              className="flex flex-wrap gap-8 pt-4"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={3}
            >
              {HOME_HERO_STATS.map((item) => (
                <div key={item.id} className="space-y-1">
                  <p className="text-3xl font-bold text-white">{item.value}</p>
                  <p className="text-sm text-white/40">{item.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Personal Image */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.7, ease: "easeOut" }}
          >
            <div className="relative overflow-hidden rounded-2xl">
              <Image
                src="/images/avatar.png"
                alt="Nguyễn Phát — Fullstack Developer"
                width={600}
                height={700}
                className="h-auto w-full object-cover"
                priority
              />
              {/* Glassmorphism overlay at bottom */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-md p-6">
                <p className="text-sm font-medium text-white/50">Đang Tập Trung</p>
                <h2 className="text-lg font-semibold text-white">
                  Design System + Fullstack Delivery
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="ds-chip text-xs">React 19</span>
                  <span className="ds-chip text-xs">Next.js 16</span>
                  <span className="ds-chip text-xs">TypeScript</span>
                  <span className="ds-chip text-xs">Tailwind v4</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
