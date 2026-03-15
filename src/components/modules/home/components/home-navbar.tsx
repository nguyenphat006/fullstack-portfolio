"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Menu01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { HOME_NAV_LINKS } from "../constants";

export function HomeNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "ds-glass py-3" : "py-5"
      }`}
    >
      <div className="ds-container flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="cursor-pointer text-2xl font-bold tracking-tight"
        >
          <span className="ds-gradient-text">NP</span>
          <span className="text-[var(--color-text)]">.</span>
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden items-center gap-8 md:flex">
          {HOME_NAV_LINKS.map((link) => (
            <li key={link.id}>
              <Link
                href={link.href}
                className="cursor-pointer text-sm font-medium text-[var(--color-text-muted)] transition-colors duration-200 hover:text-[var(--color-cta)]"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile Toggle */}
        <button
          className="cursor-pointer text-[var(--color-text)] md:hidden"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label={isMobileOpen ? "Đóng menu" : "Mở menu"}
        >
          <HugeiconsIcon
            icon={isMobileOpen ? Cancel01Icon : Menu01Icon}
            size={24}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div className="ds-glass mt-2 border-t border-border md:hidden">
          <ul className="ds-container flex flex-col gap-4 py-6">
            {HOME_NAV_LINKS.map((link) => (
              <li key={link.id}>
                <Link
                  href={link.href}
                  className="cursor-pointer block text-base font-medium text-[var(--color-text-muted)] transition-colors duration-200 hover:text-[var(--color-cta)]"
                  onClick={() => setIsMobileOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
