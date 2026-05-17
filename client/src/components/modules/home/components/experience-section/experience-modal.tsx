"use client";

import Image from "next/image";
import { X, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { HOME_EXPERIENCES } from "../../constants";

interface ExperienceModalProps {
  selectedId: string | null;
  onClose: () => void;
}

export function ExperienceModal({ selectedId, onClose }: ExperienceModalProps) {
  return (
    <AnimatePresence>
      {selectedId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 py-8 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="ds-glow-card relative max-h-[85vh] w-full max-w-3xl overflow-y-auto overflow-x-hidden bg-[#171717] p-6 shadow-2xl md:p-8 scrollbar-custom"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full bg-white/5 p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            {(() => {
              const item = HOME_EXPERIENCES.find((e) => e.id === selectedId);
              if (!item) return null;

              return (
                <div className="space-y-8">
                  {/* Modal Header */}
                  <div className="flex flex-col md:flex-row items-start gap-5 border-b border-white/10 pb-6">
                    <div className="relative h-16 w-32 shrink-0 overflow-hidden rounded-xl bg-white/5 p-2">
                      <Image src={item.logo} alt={item.company} fill className="object-contain p-1" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black uppercase tracking-wider text-white">{item.company}</h2>
                      <p className="text-[var(--color-cta)]">{item.role}</p>
                      <p className="mt-1 text-sm text-white/40">{item.period} • {item.location}</p>
                    </div>
                  </div>

                  {/* Tree View Structure */}
                  <div className="space-y-6">
                    {item.details && item.details.length > 0 ? (
                      item.details.map((detailSection, idx) => (
                        <div key={idx} className="relative pl-6">
                          {/* Branching Line */}
                          <div className="absolute left-2.5 top-0 bottom-0 w-px bg-white/10" />

                          <h4 className="relative mb-3 flex items-center text-sm font-bold tracking-widest text-[#B5915F] uppercase">
                            <span className="absolute -left-[29px] h-2 w-2 rounded-full bg-[var(--color-cta)] ring-4 ring-[#171717]" />
                            {detailSection.category}
                          </h4>
                          <ul className="space-y-3 pb-2">
                            {detailSection.items.map((bullet, i) => (
                              <li key={i} className="relative text-sm font-light leading-relaxed text-white/70 before:absolute before:-left-6 before:top-2 before:h-px before:w-3 before:bg-white/20">
                                {bullet}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))
                    ) : (
                      <p className="text-white/50 italic py-4">Chưa có thông tin chi tiết.</p>
                    )}
                    {/* Projects Linked */}
                    {item.projectLinks && item.projectLinks.length > 0 && (
                      <div className="mt-8 pt-6 border-t border-white/10">
                        <h4 className="text-sm font-bold tracking-widest text-[#B5915F] uppercase mb-4">Các dự án nổi bật</h4>
                        <div className="flex flex-wrap gap-3">
                          {item.projectLinks.map((link) => (
                            <a 
                              key={link.name} 
                              href={link.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="group flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 py-1.5 pl-2.5 pr-4 transition-all hover:bg-[var(--color-cta)]/10 hover:border-[var(--color-cta)]/30"
                            >
                              {link.logo ? (
                                <div className="relative h-6 w-6 overflow-hidden rounded-full bg-white/10 p-0.5">
                                  <Image src={link.logo} alt={link.name} fill className="object-cover rounded-full" />
                                </div>
                              ) : (
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-cta)]/20 text-[var(--color-cta)]">
                                   <ExternalLink className="h-3 w-3" />
                                </div>
                              )}
                              <span className="text-xs font-semibold text-white/80 transition-colors group-hover:text-[var(--color-cta)]">{link.name}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
