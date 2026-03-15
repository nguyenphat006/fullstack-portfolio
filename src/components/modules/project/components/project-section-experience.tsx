import { HugeiconsIcon } from "@hugeicons/react";
import { Briefcase07Icon } from "@hugeicons/core-free-icons";
import { PROJECT_EXPERIENCE_DATA } from "../constants";

export function ProjectSectionExperience() {
  return (
    <section className="ds-section pt-0">
      <div className="ds-container space-y-8">
        <div className="space-y-3">
          <p className="ds-badge">Work Journey</p>
          <h2 className="text-3xl font-bold tracking-tight text-[var(--color-text)] md:text-4xl">Experience</h2>
        </div>

        <div className="grid gap-6">
          {PROJECT_EXPERIENCE_DATA.map((item) => (
            <article key={item.id} className="ds-card">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center rounded-xl bg-[var(--color-secondary)]/60 p-2 text-[var(--color-cta)]">
                    <HugeiconsIcon icon={Briefcase07Icon} size={20} />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--color-text)]">{item.role}</h3>
                    <p className="text-sm text-[var(--color-text-muted)]">{item.company}</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-[var(--color-text-muted)]">{item.period}</span>
              </div>
              <ul className="mt-5 space-y-3">
                {item.highlights.map((highlight) => (
                  <li key={highlight} className="ds-list-item text-sm text-[var(--color-text-muted)]">
                    {highlight}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
