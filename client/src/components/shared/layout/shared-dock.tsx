"use client";

import { useState } from "react";
import Link from "next/link";
import { Home, Download, Menu } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/landing/ui/tooltip";
import { Dock, DockIcon } from "@/components/landing/ui/dock";
import { Icons } from "@/components/shared/icons";
import { useLanding } from "@/content/provider";
import { FullscreenMenu } from "./fullscreen-menu";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";

const ICON_CLASS =
  "cursor-pointer rounded-full border border-foreground/10 bg-foreground/5 p-0 text-foreground/70 transition-colors hover:bg-foreground/15 hover:text-foreground backdrop-blur-3xl";
const TOOLTIP_CLASS = "rounded-xl border-foreground/10 px-4 py-2 text-sm";

export function SharedDock() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { home, shared, path } = useLanding();

  const socials = [
    { id: "github", label: "GitHub", href: "https://github.com/nguyenphat006", icon: Icons.github },
    { id: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/in/ericss-ndp/", icon: Icons.linkedin },
    { id: "email", label: "Email", href: `mailto:${home.contact.email}`, icon: Icons.email },
    { id: "cv", label: shared.ui.downloadCv, href: home.contact.secondaryCta.href, icon: Download },
  ];

  return (
    <>
      <TooltipProvider delayDuration={0}>
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50">
          <Dock
            magnification={65}
            distance={100}
            className="pointer-events-auto relative z-50 mx-auto flex h-[56px] w-fit items-end gap-2 rounded-full border border-foreground/10 bg-card/90 p-2 shadow-[0_0_10px_3px] shadow-foreground/5 backdrop-blur-3xl"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={path("/")} className="flex" aria-label={shared.ui.home}>
                  <DockIcon className={ICON_CLASS}>
                    <Home className="size-full overflow-hidden rounded-[inherit] object-contain" />
                  </DockIcon>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={12} className={TOOLTIP_CLASS}>
                <p>{shared.ui.home}</p>
              </TooltipContent>
            </Tooltip>

            <div className="h-8 w-px self-center bg-foreground/10" />

            {socials.map((item) => {
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
                      <DockIcon className={ICON_CLASS}>
                        <Icon className="size-full overflow-hidden rounded-[inherit] object-contain" />
                      </DockIcon>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent side="top" sideOffset={12} className={TOOLTIP_CLASS}>
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}

            <div className="h-8 w-px self-center bg-foreground/10" />

            {/* Ngôn ngữ + giao diện sáng/tối */}
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex">
                  <DockIcon className={ICON_CLASS}>
                    <LanguageSwitcher className="block size-full rounded-[inherit]" />
                  </DockIcon>
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={12} className={TOOLTIP_CLASS}>
                <p>{shared.ui.language.label}</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex">
                  <DockIcon className={ICON_CLASS}>
                    <ThemeToggle className="block size-full rounded-[inherit] p-[22%]" />
                  </DockIcon>
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={12} className={TOOLTIP_CLASS}>
                <p>{shared.ui.theme.toggle}</p>
              </TooltipContent>
            </Tooltip>

            <div className="h-8 w-px self-center bg-foreground/10" />

            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => setIsMenuOpen(true)} className="flex" aria-label={shared.ui.menu}>
                  <DockIcon className={ICON_CLASS}>
                    <Menu className="size-full overflow-hidden rounded-[inherit] object-contain" />
                  </DockIcon>
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={12} className={TOOLTIP_CLASS}>
                <p>{shared.ui.menu}</p>
              </TooltipContent>
            </Tooltip>
          </Dock>
        </div>
      </TooltipProvider>

      <FullscreenMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}
