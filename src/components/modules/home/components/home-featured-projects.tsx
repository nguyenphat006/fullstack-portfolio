"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { HOME_FEATURED_PROJECTS } from "../constants";

const projectImages: Record<string, string> = {
  "project-1": "/images/project-dashboard.png",
  "project-2": "/images/project-ecommerce.png",
  "project-3": "/images/project-content.png",
};

export function HomeFeaturedProjects() {
  return (
    <section id="du-an" className="ds-section lg:pl-20">
      <div className="ds-container space-y-10">
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <p className="ds-badge">Dự Án Nổi Bật</p>
          <h2 className="text-3xl font-bold tracking-tight text-[var(--color-text)] md:text-4xl lg:text-5xl">
            Các Dự Án <span className="ds-gradient-text">Tiêu Biểu</span>
          </h2>
          <p className="max-w-3xl text-base text-[var(--color-text-muted)] md:text-lg">
            Sản phẩm thực tế được xây dựng với hiệu năng, bảo trì và tính nhất quán thiết kế.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {HOME_FEATURED_PROJECTS.map((project, i) => (
            <motion.article
              key={project.id}
              className={`ds-glow-card overflow-hidden ${
                project.featured ? "md:col-span-2 lg:col-span-2" : ""
              }`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -4 }}
            >
              {/* Project Image */}
              <div className="relative -mx-6 -mt-6 mb-5 h-48 overflow-hidden bg-secondary/20">
                <Image
                  src={projectImages[project.id] || "/images/project-dashboard.png"}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
                <span className="absolute bottom-3 left-4 text-xs font-medium text-[var(--color-accent-earth)]">
                  {project.year}
                </span>
              </div>

              <div className="flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-[var(--color-text)]">
                    {project.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
                    {project.summary}
                  </p>
                </div>

                <div className="mt-5">
                  <ul className="flex flex-wrap gap-2">
                    {project.stack.map((tech) => (
                      <li key={tech} className="ds-chip text-xs">
                        {tech}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={project.href}
                    className="mt-4 inline-flex cursor-pointer items-center text-sm font-medium text-[var(--color-cta)] transition-colors duration-200 hover:text-[var(--color-accent-earth)]"
                  >
                    Xem Chi Tiết
                    <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="ml-1" />
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <Button asChild variant="outline" className="ds-btn-secondary">
            <Link href="/projects" className="cursor-pointer">
              Xem Tất Cả Dự Án
              <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="ml-2" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
