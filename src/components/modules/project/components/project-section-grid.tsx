import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";
import { PROJECT_SECTION_DATA } from "../constants";

export function ProjectSectionGrid() {
  return (
    <section className="ds-section">
      <div className="ds-container space-y-8">
        <div className="space-y-3">
          <p className="ds-badge">Selected Work</p>
          <h1 className="text-4xl font-bold tracking-tight text-[var(--color-text)] md:text-5xl">Projects</h1>
          <p className="max-w-3xl text-base text-[var(--color-text-muted)] md:text-lg">
            Production-focused projects built with performance, maintainability, and design consistency in mind.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {PROJECT_SECTION_DATA.map((project) => (
            <article key={project.id} className="ds-card">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--color-text-muted)]">{project.year}</span>
                <HugeiconsIcon icon={ArrowRight01Icon} size={18} className="text-[var(--color-cta)]" />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-[var(--color-text)]">{project.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-muted)]">{project.summary}</p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {project.stack.map((item) => (
                  <li key={item} className="ds-chip text-xs">
                    {item}
                  </li>
                ))}
              </ul>
              <Link href={project.href} className="mt-6 inline-flex cursor-pointer items-center text-sm font-medium text-[var(--color-cta)]">
                Case Study
                <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="ml-1" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
