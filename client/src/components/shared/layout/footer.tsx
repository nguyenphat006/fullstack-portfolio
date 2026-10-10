"use client";

import Link from "next/link";
import { useLanding } from "@/content/provider";

export function Footer() {
  const { home, shared } = useLanding();

  return (
    <footer className="relative z-20 w-full bg-transparent">
      <div className="ds-container flex flex-col items-center justify-between gap-6 py-8 pb-28 sm:flex-row">
        <p className="text-sm text-foreground/70">
          © {new Date().getFullYear()} {shared.ui.copyright}
        </p>
        <div className="flex items-center gap-6">
          {home.contact.socials.map((social) => (
            <Link
              key={social.id}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-foreground/70 transition-colors hover:text-[var(--color-cta)]"
              aria-label={social.label}
            >
              {social.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
