"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/shared/section-header";
import { HOME_FEATURED_PROJECTS } from "../../constants";
import { cn } from "@/lib/utils";

export function HomeFeaturedProjects() {
  return (
    <section id="du-an" className="relative py-24 overflow-hidden bg-black/20">
      <div className="ds-container relative space-y-24">
        <SectionHeader
          badge="Portfolio"
          title="Dự Án"
          accent="Thực Chiến"
          description="Những sản phẩm thực tế được tối ưu hóa về hiệu năng và trải nghiệm người dùng."
        />

        <div className="flex flex-col gap-32">
          {HOME_FEATURED_PROJECTS.map((project, i) => (
            <ProjectItem key={project.id} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectItem({ project, index }: { project: (typeof HOME_FEATURED_PROJECTS)[0], index: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const imageScale = useTransform(scrollYProgress, [0, 0.5], [1.1, 1]);
  const textOpacity = useTransform(scrollYProgress, [0.1, 0.3], [0, 1]);
  const textY = useTransform(scrollYProgress, [0.1, 0.3], [40, 0]);

  const isEven = index % 2 === 0;

  return (
    <div ref={containerRef} className="relative w-full min-h-[60vh] flex items-center">
      {/* Background Big Number */}
      <div className="absolute -left-12 top-0 select-none opacity-[0.03] text-[20rem] font-black leading-none text-white pointer-events-none">
        0{index + 1}
      </div>

      <div className={cn(
        "flex flex-col lg:flex-row items-center gap-12 lg:gap-20 w-full",
        !isEven && "lg:flex-row-reverse"
      )}>
        {/* Sticky Visual Part */}
        <div className="relative w-full lg:w-3/5 aspect-[16/10] group rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
          <motion.div style={{ scale: imageScale }} className="w-full h-full">
            <Image
              src={project.thumbnail}
              alt={project.title}
              fill
              className="object-contains transition-transform duration-700 group-hover:scale-105"
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-transparent to-transparent opacity-60" />

          {/* Top Badges */}
          <div className="absolute top-6 left-6 flex gap-2">
            {project.badges?.map(badge => (
              <span key={badge} className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] uppercase font-bold tracking-widest text-white border border-white/10 shadow-lg">
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* Content Part */}
        <motion.div
          style={{ opacity: textOpacity, y: textY }}
          className="w-full lg:w-2/5 space-y-8"
        >
          <div className="space-y-4">
            <h3 className="text-4xl md:text-5xl font-black text-white leading-tight uppercase tracking-tighter italic">
              {project.title}
            </h3>
            <div className="h-1 w-20 bg-[var(--color-cta)]" />
          </div>

          <div className="relative p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]">
            <p className="text-lg text-white/70 leading-relaxed font-light">
              {project.summary}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {project.stack.map(tech => (
              <span key={tech} className="text-xs font-mono text-[var(--color-cta)] bg-[var(--color-cta)]/10 px-3 py-1.5 rounded-lg border border-[var(--color-cta)]/20">
                {tech}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-6 pt-4">
            <Button asChild className="h-14 px-8 bg-white text-black hover:bg-white/90 rounded-full font-bold group">
              <a href={project.liveUrl} target="_blank" rel="noreferrer">
                XEM LIVE
                <ArrowUpRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </a>
            </Button>

            <a
              href={project.sourceUrl || "#"}
              className="group flex items-center gap-2 text-sm font-bold text-white/50 hover:text-white transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              <span>SOURCE CODE</span>
              <div className="h-[1px] w-0 bg-white transition-all group-hover:w-full" />
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
