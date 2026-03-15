import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  Github01Icon,
  Linkedin01Icon,
  Mail01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { HOME_CONTACT_CONTENT } from "../constants";

const socialIconMap: Record<string, typeof Github01Icon> = {
  GithubIcon: Github01Icon,
  Linkedin01Icon: Linkedin01Icon,
  Mail01Icon: Mail01Icon,
};

export function HomeContactSection() {
  return (
    <section id="lien-he" className="ds-section relative overflow-hidden">
      {/* Background glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse at 50% 80%, var(--cta-glow) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />

      <div className="ds-container relative z-10">
        {/* CTA Block */}
        <div className="mx-auto max-w-3xl space-y-8 text-center ds-reveal">
          <span className="ds-badge">{HOME_CONTACT_CONTENT.badge}</span>
          <h2 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            <span className="ds-gradient-text">{HOME_CONTACT_CONTENT.headline}</span>
          </h2>
          <p className="mx-auto max-w-xl text-base text-[var(--color-text-muted)] md:text-lg">
            {HOME_CONTACT_CONTENT.subtext}
          </p>

          <div className="flex flex-wrap justify-center gap-4 ds-reveal ds-reveal-delay-2">
            <Button asChild className="ds-btn-neon">
              <Link
                href={HOME_CONTACT_CONTENT.primaryCta.href}
                className="cursor-pointer"
              >
                {HOME_CONTACT_CONTENT.primaryCta.label}
                <HugeiconsIcon icon={ArrowRight01Icon} size={18} className="ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="ds-btn-secondary">
              <Link
                href={HOME_CONTACT_CONTENT.secondaryCta.href}
                className="cursor-pointer"
              >
                {HOME_CONTACT_CONTENT.secondaryCta.label}
              </Link>
            </Button>
          </div>

          {/* Social Links */}
          <div className="flex justify-center gap-4 ds-reveal ds-reveal-delay-3">
            {HOME_CONTACT_CONTENT.socials.map((social) => (
              <a
                key={social.id}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer inline-flex items-center justify-center rounded-xl border border-border bg-secondary/30 p-3 text-[var(--color-text-muted)] transition-all duration-200 hover:border-[var(--color-cta)] hover:text-[var(--color-cta)] hover:shadow-[0_0_12px_var(--cta-glow)]"
                aria-label={social.label}
              >
                <HugeiconsIcon
                  icon={socialIconMap[social.iconName] || Mail01Icon}
                  size={20}
                />
              </a>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 ds-reveal ds-reveal-delay-4">
          <div className="ds-divider" />
          <div className="flex flex-col items-center justify-between gap-4 pt-8 md:flex-row">
            <p className="text-sm text-[var(--color-text-muted)]">
              © 2026 Nguyễn Phát. Mọi quyền được bảo lưu.
            </p>
            <p className="text-sm text-[var(--color-text-muted)]">
              Xây dựng với{" "}
              <span className="text-[var(--color-cta)]">Next.js</span> &{" "}
              <svg
                viewBox="0 0 24 24"
                fill="var(--cta)"
                className="inline h-4 w-4"
                aria-label="tình yêu"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </p>
          </div>
        </footer>
      </div>
    </section>
  );
}
