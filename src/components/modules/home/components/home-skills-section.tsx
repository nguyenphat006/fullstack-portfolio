"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { SectionHeader } from "@/components/shared/section-header";
import { HOME_EDUCATION } from "../constants";
import { GraduationCap, Code2 } from "lucide-react";
import { IconCloud } from "@/components/ui/icon-cloud";

const slugs = [
  "react", "nextdotjs", "typescript", "tailwindcss",
  "nodedotjs", "postgresql", "figma", "docker",
  "prisma", "nestjs", "amazonaws", "mysql",
  "nginx", "redux", "git", "github",
  "gitlab", "html5", "css3", "javascript",
  "dotnet", "csharp", "vercel", "turborepo"
];

export function HomeSkillsSection() {
  return (
    <section id="ky-nang" className="ds-section relative overflow-hidden">
      <div className="ds-container relative space-y-16">
        <SectionHeader
          badge="Background"
          title="Học Vấn"
          accent="& Kỹ Năng"
          description="Nền tảng học thuật và các bộ công cụ phát triển phần mềm."
        />

        <div className="grid gap-16 lg:grid-cols-2 lg:gap-12">
          {/* Left: Education (Basic Vertical Timeline) */}
          <div className="space-y-8">
            <h3 className="flex items-center gap-3 text-2xl font-black text-white uppercase tracking-wider">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-[var(--color-cta)]">
                <GraduationCap className="h-5 w-5" />
              </div>
              Hành trình Học tập
            </h3>
            
            <div className="relative border-l border-white/10 pl-8 ml-4 space-y-12">
              {HOME_EDUCATION.map((edu, i) => (
                <motion.div
                  key={edu.id}
                  className="relative"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  {/* Timeline Dot */}
                  <div className="absolute -left-[39px] top-1.5 h-3.5 w-3.5 rounded-full bg-[var(--color-cta)] ring-4 ring-[#111111] shadow-[0_0_10px_var(--color-cta)]" />
                  
                  <div className="flex flex-col gap-3">
                    <span className="inline-flex items-center rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-[var(--color-cta)] w-fit border border-white/5">
                      {edu.period} • {edu.location}
                    </span>
                    
                    <div className="flex items-center gap-4">
                       <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5 p-2">
                         <Image src={edu.logo} alt={edu.school} fill className="object-contain p-1" />
                       </div>
                       <div>
                         <h4 className="text-xl font-bold text-white">{edu.school}</h4>
                         <p className="text-sm font-medium text-white/60">{edu.degree}</p>
                       </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Skills (Interactive Icon Cloud) */}
          <div className="flex flex-col items-center justify-center space-y-8">
            {/* 3D Interactive Globe - No Background constraint */}
            <div className="flex w-full max-w-[800px] items-center justify-center">
              <IconCloud images={slugs.map((slug) => `https://cdn.simpleicons.org/${slug}`)} />
            </div>
            
            <div className="w-full rounded-2xl border border-[var(--color-cta)]/20 bg-[var(--color-cta)]/5 p-6 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] backdrop-blur-sm">
              <p className="text-sm leading-relaxed text-white/70">
                <strong className="text-white block mb-2 text-base">My Tech Stack Focus:</strong>
                Chuyên môn sâu rộng với React, Next.js (App Router), và hệ sinh thái TypeScript. Vững chắc về Backend API với Node.js / ASP.NET Core và Database. Sử dụng thuần thục hệ thống Monorepo, Docker và các quy trình CI/CD.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
