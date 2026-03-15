import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  BookOpen01Icon,
  Briefcase07Icon,
  CodeCircleIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { HOME_HERO_CONTENT, HOME_HERO_STATS } from "../constants";

const iconMap = {
  CodeCircleIcon,
  Briefcase07Icon,
  BookOpen01Icon,
};

export function HomeHeroSection() {
  return (
    <section className="ds-section relative overflow-hidden pt-28 md:pt-32">
      {/* Floating decorations */}
      <div
        className="ds-float-slow pointer-events-none absolute top-20 left-10 h-32 w-32 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, var(--cta-glow), transparent)" }}
        aria-hidden="true"
      />
      <div
        className="ds-float-medium pointer-events-none absolute right-16 bottom-32 h-24 w-24 rounded-full opacity-15"
        style={{ background: "radial-gradient(circle, var(--accent-earth), transparent)" }}
        aria-hidden="true"
      />
      <div
        className="ds-float-fast pointer-events-none absolute top-1/2 left-1/3 h-16 w-16 rounded-full opacity-10"
        style={{ background: "var(--cta)" }}
        aria-hidden="true"
      />

      <div className="ds-container">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-8 ds-reveal">
            <span className="ds-badge">{HOME_HERO_CONTENT.badge}</span>
            <div className="space-y-4">
              <h1 className="text-4xl leading-tight font-bold tracking-tight text-[var(--color-text)] md:text-5xl lg:text-6xl">
                <span className="ds-gradient-text">
                  {HOME_HERO_CONTENT.headline}
                </span>
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-[var(--color-text-muted)] md:text-lg">
                {HOME_HERO_CONTENT.subtext}
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button asChild className="ds-btn-neon">
                <Link href={HOME_HERO_CONTENT.primaryCta.href} className="cursor-pointer">
                  {HOME_HERO_CONTENT.primaryCta.label}
                  <HugeiconsIcon icon={ArrowRight01Icon} size={18} className="ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="ds-btn-secondary">
                <Link href={HOME_HERO_CONTENT.secondaryCta.href} className="cursor-pointer">
                  {HOME_HERO_CONTENT.secondaryCta.label}
                </Link>
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {HOME_HERO_STATS.map((item, i) => (
                <article
                  key={item.id}
                  className={`ds-glow-card ds-reveal ds-reveal-delay-${i + 1}`}
                >
                  <div className="mb-3 inline-flex items-center justify-center rounded-xl bg-[var(--color-secondary)]/60 p-2 text-[var(--color-cta)]">
                    <HugeiconsIcon icon={iconMap[item.iconName]} size={20} />
                  </div>
                  <p className="text-2xl font-semibold text-[var(--color-text)]">
                    {item.value}
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                    {item.label}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="relative ds-reveal ds-reveal-delay-3">
            <div className="ds-hero-glow" aria-hidden="true" />
            <div className="ds-hero-visual">
              <div className="space-y-4">
                <p className="text-sm font-medium text-[var(--color-text-muted)]">
                  Đang Tập Trung
                </p>
                <h2 className="text-2xl font-semibold text-[var(--color-text)]">
                  Design System + Fullstack Delivery
                </h2>
                <ul className="space-y-3 text-sm text-[var(--color-text-muted)] md:text-base">
                  <li className="ds-list-item">Kiến trúc Next.js & Feature Modules</li>
                  <li className="ds-list-item">Hiệu năng & Accessibility mặc định</li>
                  <li className="ds-list-item">UI tái sử dụng với shadcn/ui + Tailwind v4</li>
                </ul>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-3">
                <div className="ds-chip">React 19</div>
                <div className="ds-chip">Next.js 16</div>
                <div className="ds-chip">TypeScript</div>
                <div className="ds-chip">Tailwind v4</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
