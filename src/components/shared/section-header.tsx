"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  badge?: string;
  title: string;
  accent?: string;
  description?: string;
  align?: "center" | "left";
  className?: string;
  delay?: number;
};

export function SectionHeader({
  badge,
  title,
  accent,
  description,
  align = "center",
  className,
  delay = 0,
}: SectionHeaderProps) {
  const isCentered = align === "center";

  return (
    <motion.div
      className={cn("space-y-3", isCentered && "text-center", className)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay }}
    >
      {badge ? (
        <span className={cn("ds-badge", isCentered && "mx-auto")}>{badge}</span>
      ) : null}
      <h2 className="text-3xl font-bold tracking-tight text-[var(--color-text)] md:text-4xl lg:text-5xl">
        {title} {accent ? <span className="ds-gradient-text">{accent}</span> : null}
      </h2>
      {description ? (
        <p
          className={cn(
            "text-base text-[var(--color-text-muted)] md:text-lg",
            isCentered && "mx-auto max-w-2xl"
          )}
        >
          {description}
        </p>
      ) : null}
    </motion.div>
  );
}
