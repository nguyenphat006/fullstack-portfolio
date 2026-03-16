"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, Link02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/shared/section-header";
import { shortSentence } from "@/lib/utils";
import { HOME_FEATURED_PROJECTS } from "../constants";

export function HomeFeaturedProjects() {
  return (
    <section id="du-an" className="ds-section relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-[12%] top-8 h-32 w-32 rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="ds-container relative space-y-12">
        <SectionHeader
          badge="Projects"
          title="Dự Án"
          accent="Nổi Bật"
          description="Tập trung vào sản phẩm thực tế, tối ưu trải nghiệm và hiệu năng."
        />

        <div className="grid gap-8 lg:grid-cols-2">
          {HOME_FEATURED_PROJECTS.map((project, i) => (
            <motion.article
              key={project.id}
              className="ds-glow-card overflow-hidden"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <div className="relative -mx-6 -mt-6 mb-6 h-56 overflow-hidden bg-secondary/30 md:h-64">
                <Image
                  src={project.thumbnail}
                  alt={project.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                  {project.badges?.map((badge) => (
                    <span key={badge} className="ds-chip text-xs">
                      {badge}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-xl font-semibold text-white">{project.title}</h3>
                  <span className="text-xs uppercase tracking-[0.2em] text-white/40">
                    {project.period}
                  </span>
                </div>

                <p className="text-sm leading-relaxed text-white/70">
                  {shortSentence(project.summary)}
                </p>

                <ul className="flex flex-wrap gap-2">
                  {project.stack.map((tech) => (
                    <li key={tech} className="ds-chip text-xs">
                      {tech}
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap items-center gap-3">
                  <Button asChild className="ds-btn-primary">
                    <a href={project.liveUrl} target="_blank" rel="noreferrer">
                      View Live
                      <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="ml-2" />
                    </a>
                  </Button>
                  {project.sourceUrl ? (
                    <a
                      href={project.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold text-white/70"
                    >
                      <HugeiconsIcon icon={Link02Icon} size={14} />
                      Source
                    </a>
                  ) : null}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
