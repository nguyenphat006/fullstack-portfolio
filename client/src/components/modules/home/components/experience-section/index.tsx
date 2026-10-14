"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { ChevronRight, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { SectionHeader } from "@/components/shared/section-header";
import { useLanding } from "@/content/provider";
import { cn } from "@/lib/utils";
import { ExperienceModal } from "./experience-modal";

/** Kinh nghiệm: timeline dọc gọn, mỗi mốc một thẻ ngang (logo · vị trí · mô tả · hành động). */
export function HomeExperienceSection() {
  const { home } = useLanding();
  const t = home.ui.experience;
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Khóa cuộn trang khi mở modal chi tiết
  useEffect(() => {
    document.body.style.overflow = selectedId ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedId]);

  return (
    <section id="kinh-nghiem" className="ds-section relative">
      <div className="ds-container relative space-y-14 lg:pl-20">
        <SectionHeader badge={t.badge} title={t.title} accent={t.accent} description={t.description} />

        <ol className="relative mx-auto max-w-4xl space-y-6 border-l border-foreground/10 pl-6 sm:pl-10">
          {home.experiences.map((item, i) => (
            <motion.li
              key={item.id}
              className="relative"
              initial={{ y: 24 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Mốc thời gian */}
              <span
                aria-hidden="true"
                className={cn(
                  "absolute -left-[31px] top-8 size-3 rounded-full border-2 border-background sm:-left-[47px]",
                  i === 0 ? "bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.15)]" : "bg-foreground/40",
                )}
              />

              <article className="group rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-sm transition-colors duration-300 hover:border-foreground/25 sm:p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-white p-1.5 ring-1 ring-foreground/10">
                    <Image src={item.logo} alt={`${item.company} logo`} fill sizes="56px" className="object-contain p-1.5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                      <h3 className="text-lg font-semibold tracking-tight text-foreground">{item.company}</h3>
                      <p className="text-xs font-medium text-muted-foreground">
                        {item.period} · {item.location}
                      </p>
                    </div>
                    <p className="mt-0.5 text-sm font-medium text-foreground/80">{item.role}</p>
                    {item.description && (
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                    )}

                    <div className="mt-4 flex items-center gap-5">
                      <button
                        onClick={() => setSelectedId(item.id)}
                        className="group/btn inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-[var(--color-cta)]"
                      >
                        {t.viewDetails}
                        <ChevronRight className="size-4 transition-transform group-hover/btn:translate-x-0.5" aria-hidden />
                      </button>
                      {item.websiteUrl && (
                        <a
                          href={item.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {t.website}
                          <ExternalLink className="size-3.5" aria-hidden />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            </motion.li>
          ))}
        </ol>
      </div>

      <ExperienceModal selectedId={selectedId} onClose={() => setSelectedId(null)} />
    </section>
  );
}
