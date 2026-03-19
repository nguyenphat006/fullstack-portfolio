"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Home, Download, Menu, X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Dock, DockIcon } from "@/components/ui/dock";
import { HOME_NAV_LINKS } from "@/components/modules/home/constants";
import { Icons } from "@/components/shared/icons";

// ── Fullscreen Menu Overlay ──
function FullscreenMenu({
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
              {HOME_NAV_LINKS.map((link, i) => (
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

const DOCK_SOCIALS = [
  { id: "github", label: "GitHub", href: "https://github.com/nguyenphat006", icon: Icons.github },
  { id: "linkedin", label: "LinkedIn", href: "https://linkedin.com", icon: Icons.linkedin },
  { id: "email", label: "Email", href: "mailto:nguyenphat0406@gmail.com", icon: Icons.email },
  { id: "cv", label: "Tải CV", href: "#", icon: Download },
];

export function SharedDock() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <TooltipProvider delayDuration={0}>
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50">
          <Dock
            magnification={65}
            distance={100}
            className="pointer-events-auto relative z-50 mx-auto flex h-[56px] items-end w-fit gap-2 rounded-full border border-white/10 bg-[#171717]/90 p-2 shadow-[0_0_10px_3px] shadow-white/5 backdrop-blur-3xl"
          >
            {/* Home */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="#trang-chu"
                  className="flex"
                  aria-label="Trang chủ"
                >
                  <DockIcon className="cursor-pointer rounded-full border border-white/10 bg-white/5 p-0 text-white/50 transition-colors hover:bg-white/15 hover:text-white backdrop-blur-3xl">
                    <Home className="size-full overflow-hidden rounded-[inherit] object-contain" />
                  </DockIcon>
                </Link>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                sideOffset={12}
                className="rounded-xl border-white/10 px-4 py-2 text-sm shadow-[0_10px_40px_-10px_rgba(255,255,255,0.1)]"
              >
                <p>Trang chủ</p>
              </TooltipContent>
            </Tooltip>

            {/* Separator */}
            <div className="h-8 w-px bg-white/10 self-center" />

            {/* Socials & Actions */}
            {DOCK_SOCIALS.map((item) => {
              const Icon = item.icon;
              const isExternal = item.href.startsWith("http");

              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <a
                      href={item.href}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      className="flex"
                      aria-label={item.label}
                    >
                      <DockIcon className="cursor-pointer rounded-full border border-white/10 bg-white/5 p-0 text-white/50 transition-colors hover:bg-white/15 hover:text-white backdrop-blur-3xl">
                        <Icon className="size-full overflow-hidden rounded-[inherit] object-contain" />
                      </DockIcon>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    sideOffset={12}
                    className="rounded-xl border-white/10 px-4 py-2 text-sm shadow-[0_10px_40px_-10px_rgba(255,255,255,0.1)]"
                  >
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}

            {/* Separator */}
            <div className="h-8 w-px bg-white/10 self-center" />

            {/* Burger Menu Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setIsMenuOpen(true)}
                  className="flex"
                  aria-label="Menu"
                >
                  <DockIcon className="cursor-pointer rounded-full border border-white/10 bg-white/5 p-0 text-white/50 transition-colors hover:bg-white/15 hover:text-white backdrop-blur-3xl">
                    <Menu className="size-full overflow-hidden rounded-[inherit] object-contain" />
                  </DockIcon>
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                sideOffset={12}
                className="rounded-xl border-white/10 px-4 py-2 text-sm shadow-[0_10px_40px_-10px_rgba(255,255,255,0.1)]"
              >
                <p>Menu</p>
              </TooltipContent>
            </Tooltip>
          </Dock>
        </div>
      </TooltipProvider>

      <FullscreenMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
    </>
  );
}
