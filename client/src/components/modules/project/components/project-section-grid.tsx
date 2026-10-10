"use client";

import { motion } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { SectionHeader } from "@/components/shared/section-header";
import { useLanding } from "@/content/provider";
import { useRef } from "react";
import { fmt } from "@/content/format";

export function ProjectSectionGrid() {
  const { project: content, path } = useLanding();
  const { ui, items } = content;
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -(scrollRef.current.clientWidth * 0.8), behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: scrollRef.current.clientWidth * 0.8, behavior: "smooth" });
    }
  };

  const navBtn =
    "flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full border border-border bg-foreground/5 text-foreground shadow-lg transition-all hover:bg-[var(--color-cta)] hover:text-background hover:border-[var(--color-cta)] hover:scale-105 active:scale-95";

  return (
    <section className="relative overflow-hidden pt-24 w-full">
      <div className="ds-container relative mb-16 w-full flex justify-center">
        {/* Tách Header ra giữa thuần tuý */}
        <div className="w-full text-center">
          <SectionHeader badge={ui.badge} title={ui.title} description={ui.description} />
        </div>

        {/* Nút Điều khiển đẩy sang bên phải bằng absolute, ko làm lệch Title */}
        <div className="absolute bottom-4 right-4 md:right-0 flex gap-4">
          <button type="button" onClick={scrollLeft} className={navBtn} aria-label={ui.prev}>
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
          </button>
          <button type="button" onClick={scrollRight} className={navBtn} aria-label={ui.next}>
            <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
          </button>
        </div>
      </div>

      {/* Căn giữa màn hình trên Desktop với `max-w` và `mx-auto` */}
      <div className="w-full relative max-w-[1550px] mx-auto pl-4 md:pl-10 lg:pl-10 xl:pl-0">
        <div
          ref={scrollRef}
          className="flex w-full overflow-x-auto pb-12 snap-x snap-mandatory scrollbar-hide scroll-smooth"
        >
          {/* Đổi thành grid-rows-1 để thành 1 hàng duy nhất */}
          <div className="grid grid-rows-1 grid-flow-col gap-6 w-max mx-auto pe-[10vw] xl:pe-0">
            {items.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                viewport={{ once: true, margin: "-50px" }}
                className="snap-start shrink-0 w-[85vw] sm:w-[380px] md:w-[45vw] lg:w-[420px] xl:w-[495px] group relative overflow-hidden flex flex-col rounded-[2rem] bg-card border border-border shadow-2xl transition-all hover:bg-secondary hover:border-foreground/20"
              >
                {/* Thumbnail Layer */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-secondary">
                  <Image
                    src={project.image}
                    alt={fmt(ui.thumbAlt, { title: project.title })}
                    fill
                    sizes="(min-width: 1280px) 495px, (min-width: 1024px) 420px, (min-width: 768px) 45vw, 85vw"
                    priority={index === 0}
                    className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                  />
                  {/* Overlay Gradient (phủ lên ảnh, chữ bên trên luôn trắng) */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-60 transition-opacity duration-500" />

                  {/* Tech Stack Pills over Image */}
                  <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 pr-4 z-10">
                    {project.stack.slice(0, 3).map((stack) => (
                      <span
                        key={stack}
                        className="rounded-full bg-white/15 border border-white/20 backdrop-blur-md px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-sm"
                      >
                        {stack}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Content Layer */}
                <div className="flex flex-col justify-between flex-1 p-6 lg:p-8 bg-card/50">
                  <div>
                    <h3 className="text-xl lg:text-2xl font-bold text-foreground leading-snug mb-3">{project.title}</h3>
                    <p className="text-sm text-foreground/70 leading-relaxed line-clamp-3">{project.summary}</p>
                  </div>

                  <div className="mt-8 flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-foreground/60 tracking-widest">
                      {ui.yearLabel} {project.year}
                    </span>
                    <Link
                      href={path(`/projects/${project.id}`)}
                      aria-label={fmt(ui.viewProject, { title: project.title })}
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground/5 border border-border text-foreground transition-all group-hover:bg-[var(--color-cta)] group-hover:text-background group-hover:border-[var(--color-cta)] group-hover:scale-110 shadow-lg"
                    >
                      <ArrowUpRight className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
