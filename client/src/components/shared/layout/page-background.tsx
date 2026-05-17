"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface PageBackgroundProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export function PageBackground({ className, children, ...props }: PageBackgroundProps) {
  return (
    <main className={cn("relative min-h-screen bg-[#111111] text-[var(--color-text)] overflow-hidden", className)} {...props}>
      {/* Fixed Ambient Mesh Gradients behind everything */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        
        {/* Top Right Blob */}
        <div className="absolute -top-[20%] -right-[10%] h-[800px] w-[800px] animate-[pulse_4s_ease-in-out_infinite] rounded-full bg-fuchsia-500/10 blur-[150px]" />
        
        {/* Middle Left Blob */}
        <div className="absolute top-[30%] -left-[10%] h-[700px] w-[700px] animate-[pulse_5s_ease-in-out_infinite] rounded-full bg-indigo-500/10 blur-[150px]" />
        
        {/* Bottom Right Blob */}
        <div className="absolute -bottom-[20%] right-[10%] h-[900px] w-[900px] animate-[pulse_6s_ease-in-out_infinite] rounded-full bg-purple-500/10 blur-[180px]" />
        
        {/* Accent CTA Blob */}
        <div className="absolute top-[70%] left-[20%] h-[600px] w-[600px] animate-[pulse_7s_ease-in-out_infinite] rounded-full bg-[var(--color-cta)]/10 blur-[150px]" />
      </div>

      {/* Main Container Layer */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {children}
      </div>
    </main>
  );
}
