"use client";

import { useActionState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/shared/section-header";
import { HOME_CONTACT_CONTENT } from "@/components/modules/home/constants";
import { sendContactEmail } from "@/actions/contact";
import { toast } from "sonner";

export function HomeContactSection() {
  const [state, formAction, isPending] = useActionState(sendContactEmail, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.success);
      formRef.current?.reset();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);
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
            ref={formRef}
            action={formAction}
            className="flex flex-col gap-5 rounded-3xl bg-secondary/30 border border-white/10 p-8 shadow-2xl backdrop-blur-md"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-white/70 ml-1">Tên của bạn</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  placeholder="Họ và tên..."
                  className="w-full rounded-xl border border-white/5 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-[var(--color-cta)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--color-cta)]/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-white/70 ml-1">Email liên hệ</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  placeholder="hello@example.com"
                  className="w-full rounded-xl border border-white/5 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-[var(--color-cta)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--color-cta)]/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium text-white/70 ml-1">Nội dung tin nhắn</label>
              <textarea
                id="message"
                name="message"
                required
                rows={4}
                placeholder="Bạn muốn trao đổi về dự án gì..."
                className="w-full resize-none rounded-xl border border-white/5 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-[var(--color-cta)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--color-cta)]/50 transition-all"
              />
            </div>

            <Button disabled={isPending} type="submit" className="mt-3 w-full ds-btn-primary gap-2 py-6 text-base rounded-xl font-semibold">
              {isPending ? (
                <>Đang gửi... <Loader2 size={18} className="ml-1 animate-spin" /></>
              ) : (
                <>Gửi tin nhắn <Send size={18} className="ml-1" /></>
              )}
            </Button>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
