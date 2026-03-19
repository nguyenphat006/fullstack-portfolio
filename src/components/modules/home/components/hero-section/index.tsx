"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, MapsLocation01Icon, CodeIcon, Clock01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { shortSentence } from "@/lib/utils";
import { HOME_HERO_CONTENT, HOME_HERO_STATS } from "../../constants";
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

export function HomeHeroSection() {
  const shortSubtext = shortSentence(HOME_HERO_CONTENT.subtext);
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const vnTime = new Date().toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit' });
      setTime(vnTime);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="trang-chu" className="relative min-h-[100dvh] pt-32 pb-24 md:pt-40 md:flex md:items-center overflow-hidden">
      {/* Ambient background that floats continuously */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
        <motion.div
          animate={{ y: [0, -30, 0], scale: [1, 1.05, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-24 left-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[var(--color-cta)] blur-[120px]"
        />
        <motion.div
          animate={{ y: [0, 40, 0], x: [0, -20, 0], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-purple-600 blur-[100px]"
        />
        <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(to_right,white_2px,transparent_2px),linear-gradient(to_bottom,white_2px,transparent_2px)] [background-size:60px_60px]" />
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
          <motion.div variants={bentoVariants} className="ds-glow-card flex flex-col justify-center bg-black/40 p-8 md:col-span-8 md:row-span-2 items-start backdrop-blur-md">
            <span className="mb-6 rounded-full border border-[var(--color-cta)]/30 bg-[var(--color-cta)]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[var(--color-cta)]">
              {HOME_HERO_CONTENT.badge}
            </span>
            <h1 className="mb-6 min-h-[140px] text-4xl font-black leading-tight tracking-tight text-white md:text-5xl lg:min-h-[160px] lg:text-7xl">
              <span className="block mb-2 md:inline md:mb-0">Xin chào! </span>
              <br className="hidden md:block" />
              <TypeAnimation
                sequence={[
                  'Tôi là ERICSS.',
                  2500,
                  'Tôi là Fullstack Dev.',
                  2500,
                ]}
                wrapper="span"
                cursor={true}
                repeat={Infinity}
                className="bg-gradient-to-r from-fuchsia-400 via-purple-500 to-indigo-500 bg-clip-text text-transparent"
              />
            </h1>
            <p className="mb-8 max-w-xl text-base leading-relaxed text-white/50 md:text-lg font-light">
              <span className="text-white font-medium">Nguyễn Đăng Phát</span> — Một kỹ sư phần mềm chuyên nghiệp. Tôi đam mê xây dựng các sản phẩm công nghệ từ kiến trúc logic Backend đến giao diện Frontend tương tác mượt mà, tập trung vào trải nghiệm người dùng tối ưu qua hệ sinh thái Next.js và TypeScript.
            </p>
            <div className="flex flex-wrap gap-4 mt-auto">
              <Button asChild className="ds-btn-neon shadow-[0_0_20px_var(--color-cta-glow)]">
                <Link href={HOME_HERO_CONTENT.primaryCta.href}>
                  {HOME_HERO_CONTENT.primaryCta.label}
                  <HugeiconsIcon icon={ArrowRight01Icon} size={18} className="ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="ds-btn-secondary hover:bg-white/5 border-white/10">
                <Link href={HOME_HERO_CONTENT.secondaryCta.href}>
                  {HOME_HERO_CONTENT.secondaryCta.label}
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Tile 2: Avatar & Identity (Spans 4 cols) */}
          <motion.div variants={bentoVariants} className="ds-glow-card relative overflow-hidden flex min-h-[300px] flex-col justify-end bg-gradient-to-b from-[#1C1C1C] to-black p-0 md:col-span-4 md:row-span-2">
            <div className="absolute inset-0 z-0 flex items-center justify-center transition-all duration-700">
              <div className="relative h-64 w-64 md:h-72 md:w-72 mt-[-60px]">
                <Image src="/images/avatar.png" alt="Nguyễn Đăng Phát Avatar" fill className="object-contain" priority />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
            </div>
            <div className="relative z-10 p-6">
              <div className="mb-2 w-max rounded-md bg-purple-500/10 border border-purple-500/20 px-3 py-1 backdrop-blur-md">
                <p className="font-mono text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-fuchsia-400 to-purple-500 bg-clip-text text-transparent">ERICSS</p>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-wide">Nguyễn Đăng Phát</h2>
            </div>
          </motion.div>

          {/* Tile 3: Tech Stack Rolling (Spans 4 cols) */}
          <motion.div variants={bentoVariants} className="ds-glow-card flex flex-col justify-center items-center bg-black/40 p-6 text-center backdrop-blur-md md:col-span-4 group overflow-hidden">
            <p className="text-sm font-semibold text-white mb-6">Tech Ecosystem</p>
            <div className="relative flex w-full items-center overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
              <motion.div
                className="flex w-max shrink-0"
                animate={{ x: ["0%", "-50%"] }}
                transition={{ repeat: Infinity, ease: "linear", duration: 15 }}
              >
                {/* SET 1 */}
                <div className="flex shrink-0 gap-8 pr-8">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://skillicons.dev/icons?i=react,next,nestjs,ts,postgres,docker,tailwind,figma&theme=dark" alt="Tech Stack" className="h-10 md:h-11 shrink-0" />
                </div>
                {/* SET 2 (Exact duplicate for seamless loop) */}
                <div className="flex shrink-0 gap-8 pr-8">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://skillicons.dev/icons?i=react,next,nestjs,ts,postgres,docker,tailwind,figma&theme=dark" alt="Tech Stack Seamless" className="h-10 md:h-11 shrink-0" />
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Tile 4: Location & Time (Spans 4 cols) */}
          <motion.div variants={bentoVariants} className="ds-glow-card relative overflow-hidden flex flex-col justify-between bg-black/40 p-6 backdrop-blur-md md:col-span-4 group h-full min-h-[160px]">
            {/* Ambient Map/Location Icon Background */}
            <div className="absolute -bottom-8 -right-8 opacity-10 group-hover:opacity-30 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700 pointer-events-none">
              <HugeiconsIcon icon={MapsLocation01Icon} size={160} className="text-white" />
            </div>

            <div className="relative z-10 flex items-center gap-3 text-white mb-6">
              <div className="relative flex h-3 w-3 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 font-mono">Available For Work</span>
            </div>

            <div className="relative z-10 mt-auto">
              <p className="text-2xl font-black text-white tracking-wide">Hồ Chí Minh, VN</p>
              <div className="flex items-center gap-2 mt-2">
                <HugeiconsIcon icon={Clock01Icon} size={16} className="text-white/40" />
                <p className="font-mono text-sm tracking-widest text-[#A1A1AA]">{time || "Trực tuyến"}</p>
              </div>
            </div>
          </motion.div>

          {/* Tile 5: Stats (Spans 4 cols) */}
          <motion.div variants={bentoVariants} className="ds-glow-card flex flex-row items-center justify-around bg-black/40 p-6 backdrop-blur-md md:col-span-4">
            {HOME_HERO_STATS.map((item) => (
              <div key={item.id} className="text-center">
                <p className="text-3xl font-black text-white">{item.value}</p>
                <p className="text-[10px] uppercase tracking-widest text-white/30 mt-1">{item.label}</p>
              </div>
            )).slice(0, 2)}
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
