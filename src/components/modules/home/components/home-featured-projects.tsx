import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { HOME_FEATURED_PROJECTS } from "../constants";

export function HomeFeaturedProjects() {
  return (
    <section id="du-an" className="ds-section">
      <div className="ds-container space-y-10">
        <div className="space-y-3 ds-reveal">
          <p className="ds-badge">Dự Án Nổi Bật</p>
          <h2 className="text-3xl font-bold tracking-tight text-[var(--color-text)] md:text-4xl lg:text-5xl">
            Các Dự Án <span className="ds-gradient-text">Tiêu Biểu</span>
          </h2>
          <p className="max-w-3xl text-base text-[var(--color-text-muted)] md:text-lg">
            Sản phẩm thực tế được xây dựng với hiệu năng, bảo trì và tính nhất quán thiết kế.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {HOME_FEATURED_PROJECTS.map((project, i) => (
            <article
              key={project.id}
              className={`ds-glow-card ds-reveal ds-reveal-delay-${i + 1} ${
                project.featured ? "md:col-span-2 lg:col-span-1 lg:row-span-2" : ""
              }`}
            >
              <div className="flex h-full flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[var(--color-accent-earth)]">
                      {project.year}
                    </span>
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      size={18}
                      className="text-[var(--color-cta)]"
                    />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-[var(--color-text)]">
                    {project.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-muted)]">
                    {project.summary}
                  </p>
                </div>

                <div className="mt-6">
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
            </article>
          ))}
        </div>

        <div className="flex justify-center ds-reveal ds-reveal-delay-4">
          <Button asChild variant="outline" className="ds-btn-secondary">
            <Link href="/projects" className="cursor-pointer">
              Xem Tất Cả Dự Án
              <HugeiconsIcon icon={ArrowRight01Icon} size={18} className="ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
