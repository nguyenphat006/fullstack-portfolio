"use client";

/* eslint-disable @next/next/no-img-element -- ảnh dự án lấy từ nhiều nguồn ngoài, giữ nguyên thẻ img */

import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/landing/ui/button";
import { SectionHeader } from "@/components/shared/section-header";
import { useLanding } from "@/content/provider";
import type { ProjectItem } from "@/config/projects";
import { cn } from "@/lib/utils";

export function HomeFeaturedProjects() {
  const { home, project, path } = useLanding();
  const t = home.ui.projects;
  return (
    <section id="du-an" className="relative py-24 overflow-hidden bg-foreground/[0.03]">
      <div className="ds-container relative space-y-24">
        <SectionHeader
          badge={t.badge}
          title={t.title}
          accent={t.accent}
          description={t.description}
        />

        <div className="flex flex-col gap-32">
          {project.items.filter(p => p.featured).map((item, i) => (
            <ProjectItem key={item.id} project={item} index={i} />
          ))}
        </div>

        <div className="flex justify-center mt-16 pt-8">
           <Button asChild className="h-14 px-10 bg-[var(--color-cta)] text-background hover:bg-[var(--color-cta)]/90 rounded-full font-bold text-lg group">
             <Link href={path("/projects")}>
               {t.viewAll}
               <ArrowUpRight className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
             </Link>
           </Button>
        </div>
      </div>
    </section>
  );
}

function ProjectItem({ project, index }: { project: ProjectItem, index: number }) {
  const { home, path } = useLanding();
  const t = home.ui.projects;
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
      <div className="absolute -left-12 top-0 select-none opacity-[0.03] text-[20rem] font-black leading-none text-foreground pointer-events-none" aria-hidden="true">
        0{index + 1}
      </div>

      <div className={cn(
        "flex flex-col lg:flex-row items-center gap-12 lg:gap-20 w-full",
        !isEven && "lg:flex-row-reverse"
      )}>
        {/* Sticky Visual Part */}
        <div className="relative w-full lg:w-3/5 aspect-[16/10] group rounded-3xl overflow-hidden border border-border shadow-2xl bg-card">
          <motion.div style={{ scale: imageScale }} className="w-full h-full">
            <img
              src={project.image}
              alt={project.title}
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-transparent to-transparent opacity-80" />

          {/* Top Badges */}
          <div className="absolute top-6 left-6 flex gap-2">
            {[project.year, ...project.stack].slice(0, 3).map(badge => (
              <span key={badge} className="px-3 py-1 bg-background/80 backdrop-blur-md rounded-full text-[10px] uppercase font-bold tracking-widest text-foreground border border-border shadow-lg">
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
            <h3 className="text-4xl md:text-5xl font-black text-foreground leading-tight uppercase tracking-tighter italic">
              {project.title}
            </h3>
            <div className="h-1 w-20 bg-[var(--color-cta)]" />
          </div>

          <div className="relative p-6 rounded-3xl bg-foreground/5 border border-border backdrop-blur-xl">
            <p className="text-lg text-foreground/75 leading-relaxed font-light">
              {project.summary}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {project.stack.map(tech => (
              <span key={tech} className="text-xs font-mono text-foreground bg-[var(--color-cta)]/10 px-3 py-1.5 rounded-lg border border-[var(--color-cta)]/20">
                {tech}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-4">
            <Button asChild className="h-14 px-8 bg-foreground text-background hover:bg-foreground/90 rounded-full font-bold group">
              <Link href={path(`/projects/${project.id}`)}>
                {t.viewDetail}
                <ArrowUpRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>
            </Button>

            {project.githubUrl && (
               <a
                 href={project.githubUrl}
                 target="_blank" rel="noreferrer"
                 className="group flex items-center gap-2 text-sm font-bold text-foreground/65 hover:text-foreground transition-colors"
               >
                 <ExternalLink className="h-4 w-4" />
                 <span>{t.sourceCode}</span>
                 <div className="h-[1px] w-0 bg-foreground transition-all group-hover:w-full" />
               </a>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
