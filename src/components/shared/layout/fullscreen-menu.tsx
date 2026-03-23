"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { SITE_NAV_LINKS } from "@/config/navigation";

export function FullscreenMenu({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <button
            onClick={onClose}
            className="absolute top-8 right-8 z-10 cursor-pointer rounded-full border border-white/10 p-3 text-white/50 transition-colors duration-200 hover:text-white"
            aria-label="Đóng menu"
          >
            <X className="size-6" />
          </button>

          <nav className="relative z-10">
            <ul className="flex flex-col items-center gap-6">
              {SITE_NAV_LINKS.map((link, i) => (
                <motion.li
                  key={link.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                >
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className="cursor-pointer text-3xl font-bold text-white/70 transition-colors duration-200 hover:text-white md:text-5xl"
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
