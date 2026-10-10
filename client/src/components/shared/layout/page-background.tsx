"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface PageBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function PageBackground({ className, children, ...props }: PageBackgroundProps) {
  return (
    <div className={cn("relative min-h-screen overflow-hidden bg-background text-[var(--color-text)]", className)} {...props}>
      {/* Mesh gradient cố định phía sau nội dung (nhạt hơn ở giao diện sáng) */}
      {/* Gradient tĩnh (radial-gradient thay vì blur-[150px] + animation: rẻ hơn nhiều khi vẽ, giảm TBT/LCP) */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-60 dark:opacity-100"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(40% 35% at 90% 0%, rgba(217,70,239,0.10), transparent 70%), radial-gradient(35% 35% at 0% 40%, rgba(99,102,241,0.10), transparent 70%), radial-gradient(40% 40% at 70% 100%, rgba(168,85,247,0.10), transparent 70%)",
        }}
      />

      <div className="relative z-10 flex min-h-screen flex-col">{children}</div>
    </div>
  );
}
