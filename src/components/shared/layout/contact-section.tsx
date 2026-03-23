"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/shared/section-header";
import { HOME_CONTACT_CONTENT } from "@/components/modules/home/constants";

export function HomeContactSection() {
  return (
    <section id="lien-he" className="ds-section relative overflow-hidden pt-24 pb-8">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute inset-x-0 bottom-0 top-1/2 opacity-20"
          style={{
            background:
              "radial-gradient(ellipse at 50% 100%, var(--cta-glow) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="ds-container relative z-10 space-y-16">
        <SectionHeader
          badge={HOME_CONTACT_CONTENT.badge}
          title={HOME_CONTACT_CONTENT.headline}
          description={HOME_CONTACT_CONTENT.subtext}
        />

        <div className="mx-auto max-w-xl">
          <motion.form
            className="flex flex-col gap-5 rounded-3xl bg-secondary/30 border border-white/10 p-8 shadow-2xl backdrop-blur-md"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-white/70 ml-1">Tên của bạn</label>
                <input 
                  type="text" 
                  id="name"
                  placeholder="Họ và tên..." 
                  className="w-full rounded-xl border border-white/5 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-[var(--color-cta)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--color-cta)]/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-white/70 ml-1">Email liên hệ</label>
                <input 
                  type="email" 
                  id="email"
                  placeholder="hello@example.com" 
                  className="w-full rounded-xl border border-white/5 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-[var(--color-cta)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--color-cta)]/50 transition-all"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium text-white/70 ml-1">Nội dung tin nhắn</label>
              <textarea 
                id="message"
                rows={4}
                placeholder="Bạn muốn trao đổi về dự án gì..." 
                className="w-full resize-none rounded-xl border border-white/5 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-[var(--color-cta)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--color-cta)]/50 transition-all"
              />
            </div>

            <Button type="button" className="mt-3 w-full ds-btn-primary gap-2 py-6 text-base rounded-xl font-semibold">
              Gửi tin nhắn <Send size={18} className="ml-1" />
            </Button>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
