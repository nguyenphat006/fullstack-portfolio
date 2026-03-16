"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { SectionHeader } from "@/components/shared/section-header";
import { HOME_SKILLS } from "../constants";

export function HomeSkillsSection() {
  return (
    <section id="ky-nang" className="ds-section relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-1/2 top-6 h-28 w-28 -translate-x-1/2 rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="ds-container relative space-y-10">
        <SectionHeader
          badge="Skills"
          title="Bộ Công Cụ"
          accent="Cốt Lõi"
          description="Các kỹ năng nền tảng tôi sử dụng hằng ngày trong dự án sản phẩm."
        />

        <div className="flex flex-wrap justify-center gap-4">
          {HOME_SKILLS.map((skill, i) => (
            <motion.div
              key={skill.id}
              className="flex items-center gap-3 rounded-full border border-border bg-card/60 px-5 py-3"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
            >
              <div className="relative h-9 w-9 overflow-hidden rounded-full border border-border bg-card">
                <Image src={skill.logo} alt={skill.name} fill className="object-cover" />
              </div>
              <span className="text-sm font-medium text-white/85">{skill.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
