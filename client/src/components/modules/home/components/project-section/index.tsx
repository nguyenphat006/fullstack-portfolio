"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { SectionHeader } from "@/components/shared/section-header";
import { useLanding } from "@/content/provider";
import type { ProjectItem } from "@/config/projects";

/** Dự án nổi bật: lưới thẻ gọn (ảnh · tên · mô tả · công nghệ · liên kết). */
export function HomeFeaturedProjects() {
  const { home, project, path } = useLanding();
  const t = home.ui.projects;
  const featured = project.items.filter((p) => p.featured);

  return (
    <section id="du-an" className="ds-section relative">
      <div className="ds-container relative space-y-14 lg:pl-20">
        <SectionHeader badge={t.badge} title={t.title} accent={t.accent} description={t.description} />

        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
          {featured.map((item, i) => (
            <ProjectCard key={item.id} project={item} index={i} />
          ))}
        </div>

        <div className="flex justify-center">
          <Link
            href={path("/projects")}
            className="group inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border border-foreground/15 px-6 text-sm font-medium text-foreground transition-colors hover:border-foreground/40 hover:bg-foreground/5"
          >
            {t.viewAll}
            <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project, index }: { project: ProjectItem; index: number }) {
  const { home, path } = useLanding();
  const t = home.ui.projects;

  return (
    <motion.article
      initial={{ y: 24 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card/60 transition-colors duration-300 hover:border-foreground/25"
    >
      <Link href={path(`/projects/${project.id}`)} className="relative block aspect-[16/10] overflow-hidden bg-secondary" tabIndex={-1} aria-hidden="true">
        <Image
          src={project.image}
          alt=""
          fill
          sizes="(min-width: 768px) 480px, 100vw"
          priority={index === 0}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
        <span className="absolute left-4 top-4 rounded-full border border-border bg-background/85 px-3 py-1 text-[11px] font-medium text-foreground backdrop-blur-md">
          {project.year}
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <h3 className="text-xl font-semibold tracking-tight text-foreground">
          <Link href={path(`/projects/${project.id}`)} className="transition-colors hover:text-[var(--color-cta)]">
            {project.title}
          </Link>
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{project.summary}</p>

        <ul className="flex flex-wrap gap-2" aria-label="Tech stack">
          {project.stack.map((tech) => (
            <li key={tech} className="rounded-md border border-border bg-secondary/60 px-2.5 py-1 font-mono text-xs text-foreground/80">
              {tech}
            </li>
          ))}
        </ul>

        <div className="mt-auto flex items-center gap-5 pt-2">
          <Link
            href={path(`/projects/${project.id}`)}
            className="group/cta inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-[var(--color-cta)]"
          >
            {t.viewDetail}
            <ArrowUpRight className="size-4 transition-transform group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5" aria-hidden />
          </Link>
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ExternalLink className="size-3.5" aria-hidden />
              {t.sourceCode}
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}
