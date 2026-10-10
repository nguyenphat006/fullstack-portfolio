"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, MapsLocation01Icon, Clock01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/landing/ui/button";
import { useLanding } from "@/content/provider";
import { useState, useEffect } from "react";
import type { Variants } from "motion/react";
import { TypeAnimation } from "react-type-animation";

const bentoVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 20 }
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const TECH_ICONS = "react,next,nestjs,ts,postgres,docker,tailwind,figma";

/** Dải icon công nghệ: skillicons.dev có hai biến thể theme, hiển thị theo class `dark`. */
function TechIcons({ alt }: { alt: string }) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`https://skillicons.dev/icons?i=${TECH_ICONS}&theme=light`} alt={alt} className="h-10 md:h-11 shrink-0 dark:hidden" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`https://skillicons.dev/icons?i=${TECH_ICONS}&theme=dark`} alt={alt} className="hidden h-10 md:h-11 shrink-0 dark:block" />
    </>
  );
}

export function HomeHeroSection() {
  const { home, locale } = useLanding();
  const { hero: HOME_HERO_CONTENT, stats: HOME_HERO_STATS, ui } = home;
  const t = ui.hero;
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const vnTime = new Date().toLocaleTimeString(locale === "vi" ? "vi-VN" : "en-US", { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit' });
      setTime(vnTime);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [locale]);

  return (
    <section id="trang-chu" className="relative min-h-[100dvh] pt-32 pb-24 md:pt-40 md:flex md:items-center overflow-hidden">
      {/* Ambient background that floats continuously */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
        <motion.div
          animate={{ y: [0, -30, 0], scale: [1, 1.05, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-24 left-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,var(--color-cta),transparent)]"
        />
        <motion.div
          animate={{ y: [0, 40, 0], x: [0, -20, 0], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-[radial-gradient(closest-side,var(--color-purple-600),transparent)]"
        />
        <div className="absolute inset-0 [background-image:linear-gradient(to_right,var(--grid-line)_2px,transparent_2px),linear-gradient(to_bottom,var(--grid-line)_2px,transparent_2px)] [background-size:60px_60px]" />
      </div>

      <div className="ds-container relative z-10 w-full">
        {/* Bento Grid Container */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mx-auto grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-12 md:grid-rows-[minmax(0,1fr)_auto_auto] lg:gap-6"
        >
          {/* Tile 1: Main Welcome (Spans 8 cols) */}
          <motion.div variants={bentoVariants} className="ds-glow-card flex flex-col justify-center bg-background/40 p-8 md:col-span-8 md:row-span-2 items-start backdrop-blur-md">
            <span className="mb-6 rounded-full border border-[var(--color-cta)]/30 bg-[var(--color-cta)]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[var(--color-cta)]">
              {HOME_HERO_CONTENT.badge}
            </span>
            <h1 className="mb-6 min-h-[140px] text-4xl font-black leading-tight tracking-tight text-foreground md:text-5xl lg:min-h-[160px] lg:text-7xl">
              <span className="block mb-2 md:inline md:mb-0">{t.greeting}</span>
              <br className="hidden md:block" />
              <TypeAnimation
                sequence={[
                  t.typed[0],
                  2500,
                  t.typed[1],
                  2500,
                ]}
                wrapper="span"
                cursor={true}
                repeat={Infinity}
                className="bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 dark:from-fuchsia-400 dark:via-purple-500 dark:to-indigo-500 bg-clip-text text-transparent"
              />
            </h1>
            <p className="mb-8 max-w-xl text-base leading-relaxed text-foreground/70 md:text-lg font-light">
              <span className="text-foreground font-medium">{t.introName}</span>{t.introBody}
            </p>
            <div className="flex flex-wrap gap-4 mt-auto">
              <Button asChild className="ds-btn-neon shadow-[0_0_20px_var(--color-cta-glow)]">
                <Link href={HOME_HERO_CONTENT.primaryCta.href}>
                  {HOME_HERO_CONTENT.primaryCta.label}
                  <HugeiconsIcon icon={ArrowRight01Icon} size={18} className="ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="ds-btn-secondary hover:bg-foreground/5 border-foreground/15">
                <Link href={HOME_HERO_CONTENT.secondaryCta.href}>
                  {HOME_HERO_CONTENT.secondaryCta.label}
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Tile 2: Avatar & Identity (Spans 4 cols) */}
          <motion.div variants={bentoVariants} className="ds-glow-card relative overflow-hidden flex min-h-[300px] flex-col justify-end bg-gradient-to-b from-card to-background p-0 md:col-span-4 md:row-span-2">
            <div className="absolute inset-0 z-0 flex items-center justify-center transition-all duration-700">
              <div className="relative h-64 w-64 md:h-72 md:w-72 mt-[-60px]">
                <Image src="/images/avatar.webp" alt={t.avatarAlt} fill sizes="(min-width: 768px) 288px, 256px" className="object-contain" priority />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
            </div>
            <div className="relative z-10 p-6">
              <div className="mb-2 w-max rounded-md bg-purple-500/10 border border-purple-500/20 px-3 py-1 backdrop-blur-md">
                <p className="font-mono text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-fuchsia-700 to-purple-700 dark:from-fuchsia-400 dark:to-purple-500 bg-clip-text text-transparent">ERICSS</p>
              </div>
              <p className="text-2xl font-bold text-foreground tracking-wide">{t.identityName}</p>
            </div>
          </motion.div>

          {/* Tile 3: Tech Stack Rolling (Spans 4 cols) */}
          <motion.div variants={bentoVariants} className="ds-glow-card flex flex-col justify-center items-center bg-background/40 p-6 text-center backdrop-blur-md md:col-span-4 group overflow-hidden">
            <p className="text-sm font-semibold text-foreground mb-6">{t.techEcosystem}</p>
            <div className="relative flex w-full items-center overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_10%,#000_90%,transparent)]">
              <motion.div
                className="flex w-max shrink-0"
                animate={{ x: ["0%", "-50%"] }}
                transition={{ repeat: Infinity, ease: "linear", duration: 15 }}
              >
                {/* SET 1 */}
                <div className="flex shrink-0 gap-8 pr-8">
                  <TechIcons alt={t.techAlt} />
                </div>
                {/* SET 2 (bản sao để lặp liền mạch) */}
                <div className="flex shrink-0 gap-8 pr-8" aria-hidden="true">
                  <TechIcons alt="" />
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Tile 4: Location & Time (Spans 4 cols) */}
          <motion.div variants={bentoVariants} className="ds-glow-card relative overflow-hidden flex flex-col justify-between bg-background/40 p-6 backdrop-blur-md md:col-span-4 group h-full min-h-[160px]">
            {/* Ambient Map/Location Icon Background */}
            <div className="absolute -bottom-8 -right-8 opacity-10 group-hover:opacity-30 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700 pointer-events-none">
              <HugeiconsIcon icon={MapsLocation01Icon} size={160} className="text-foreground" />
            </div>

            <div className="relative z-10 flex items-center gap-3 text-foreground mb-6">
              <div className="relative flex h-3 w-3 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-mono">{t.availableForWork}</span>
            </div>

            <div className="relative z-10 mt-auto">
              <p className="text-2xl font-black text-foreground tracking-wide">{t.location}</p>
              <div className="flex items-center gap-2 mt-2">
                <HugeiconsIcon icon={Clock01Icon} size={16} className="text-muted-foreground" />
                <p className="font-mono text-sm tracking-widest text-muted-foreground">{time || t.online}</p>
              </div>
            </div>
          </motion.div>

          {/* Tile 5: Stats (Spans 4 cols) */}
          <motion.div variants={bentoVariants} className="ds-glow-card flex flex-row items-center justify-around bg-background/40 p-6 backdrop-blur-md md:col-span-4">
            {HOME_HERO_STATS.map((item) => (
              <div key={item.id} className="text-center">
                <p className="text-3xl font-black text-foreground">{item.value}</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{item.label}</p>
              </div>
            )).slice(0, 2)}
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
