"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { SectionHeader } from "@/components/shared/section-header";
import { PROJECTS_DATA } from "@/config/projects";
import { useRef } from "react";

export function ProjectSectionGrid() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -(scrollRef.current.clientWidth * 0.8), behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: (scrollRef.current.clientWidth * 0.8), behavior: "smooth" });
    }
  };

  return (
    <section className="relative overflow-hidden pt-24 w-full">
      <div className="ds-container relative mb-16 w-full flex justify-center">
        {/* Tách Header ra giữa thuần tuý */}
        <div className="w-full text-center">
          <SectionHeader
            badge="Sản phẩm"
            title="Dự án Nổi bật"
            description="Khám phá các sản phẩm và hệ thống mà mình đã tự tay thiết kế kiến trúc và triển khai trong suốt quãng thời gian làm nghề."
          />
        </div>

        {/* Nút Điều khiển đẩy sang bên phải bằng absolute, ko làm lệnh Title */}
        <div className="absolute bottom-4 right-4 md:right-0 flex gap-4">
          <button
            onClick={scrollLeft}
            className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white shadow-lg transition-all hover:bg-[var(--color-cta)] hover:text-black hover:border-[var(--color-cta)] hover:scale-105 active:scale-95"
            aria-label="Trang trước"
          >
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
          </button>
          <button
            onClick={scrollRight}
            className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white shadow-lg transition-all hover:bg-[var(--color-cta)] hover:text-black hover:border-[var(--color-cta)] hover:scale-105 active:scale-95"
            aria-label="Trang sau"
          >
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
            {PROJECTS_DATA.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                viewport={{ once: true, margin: "-50px" }}
                className="snap-start shrink-0 w-[85vw] sm:w-[380px] md:w-[45vw] lg:w-[420px] xl:w-[495px] group relative overflow-hidden flex flex-col rounded-[2rem] bg-secondary/30 border border-white/5 shadow-2xl transition-all hover:bg-white/5 hover:border-white/15"
              >
                {/* Thumbnail Layer */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/40">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                    loading="lazy"
                  />
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/20 to-transparent opacity-90 group-hover:opacity-60 transition-opacity duration-500" />

                  {/* Tech Stack Pills over Image */}
                  <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 pr-4 z-10">
                    {project.stack.slice(0, 3).map((stack) => (
                      <span
                        key={stack}
                        className="rounded-full bg-white/10 border border-white/10 backdrop-blur-md px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--color-cta)] shadow-sm"
                      >
                        {stack}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Content Layer */}
                <div className="flex flex-col justify-between flex-1 p-6 lg:p-8 bg-[#0a0a0a]/50">
                  <div>
                    <h3 className="text-xl lg:text-2xl font-bold text-white transition-colors group-hover:text-[var(--color-cta)] leading-snug mb-3">
                      {project.title}
                    </h3>
                    <p className="text-sm text-white/50 leading-relaxed line-clamp-3">
                      {project.summary}
                    </p>
                  </div>

                  <div className="mt-8 flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-white/20 tracking-widest">
                      NĂM / {project.year}
                    </span>
                    <Link
                      href={`/projects/${project.id}`}
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white transition-all group-hover:bg-[var(--color-cta)] group-hover:text-black group-hover:border-[var(--color-cta)] group-hover:scale-110 shadow-lg"
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
