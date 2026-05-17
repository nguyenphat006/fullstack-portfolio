"use client";

import Link from "next/link";
import { HOME_CONTACT_CONTENT } from "@/components/modules/home/constants";

export function Footer() {
  return (
    <footer className="w-full relative z-20 bg-transparent">
      <div className="ds-container flex flex-col items-center justify-between gap-6  py-8 sm:flex-row">
        <p className="text-sm text-white/50">
          © {new Date().getFullYear()} Nguyễn Phát (ERICSS). All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          {HOME_CONTACT_CONTENT.socials.map((social) => (
            <Link
              key={social.id}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-white/40 hover:text-[var(--color-cta)] transition-colors font-medium"
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
