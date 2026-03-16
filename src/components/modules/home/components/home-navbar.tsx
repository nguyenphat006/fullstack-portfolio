"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { HOME_NAV_LINKS } from "../constants";

// ── Sidebar (Desktop only — dots) ──
export function HomeNavbar() {
  const [activeSection, setActiveSection] = useState("trang-chu");

  useEffect(() => {
    const sectionIds = HOME_NAV_LINKS.filter((l) => l.href.startsWith("#"))
      .map((l) => l.href.slice(1));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const link = HOME_NAV_LINKS.find(
              (l) => l.href === `#${entry.target.id}`
            );
            if (link) setActiveSection(link.id);
          }
        });
      },
      { threshold: 0.3 }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const sections = HOME_NAV_LINKS.filter((l) => l.href.startsWith("#"));

  return (
    <div className="fixed top-0 left-0 z-50 hidden h-screen w-14 flex-col items-center justify-between py-8 lg:flex">
      {/* Logo */}
      <Link href="/" className="cursor-pointer text-lg font-bold text-white">
        N
      </Link>

      {/* Dot indicators */}
      <nav className="flex flex-col gap-4">
        {sections.map((link) => (
          <Link
            key={link.id}
            href={link.href}
            className="group relative cursor-pointer"
            aria-label={link.label}
          >
            <div
              className={`h-2 w-2 rounded-full transition-all duration-300 ${
                activeSection === link.id
                  ? "scale-150 bg-white"
                  : "bg-white/20 group-hover:bg-white/50"
              }`}
            />
            <span className="pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-[#1A1A1A] px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              {link.label}
            </span>
          </Link>
        ))}
      </nav>

      <div className="h-4" />
    </div>
  );
}
