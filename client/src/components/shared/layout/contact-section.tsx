"use client";

import { useActionState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/landing/ui/button";
import { SectionHeader } from "@/components/shared/section-header";
import { useLanding } from "@/content/provider";
import { sendContactEmail } from "@/actions/contact";
import { toast } from "sonner";

export function HomeContactSection() {
  const { home, locale } = useLanding();
  const HOME_CONTACT_CONTENT = home.contact;
  const t = home.ui.contact;
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
            className="flex flex-col gap-5 rounded-3xl bg-secondary/30 border border-border p-8 shadow-2xl backdrop-blur-md"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <input type="hidden" name="locale" value={locale} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-foreground/80 ml-1">{t.nameLabel}</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  placeholder={t.namePlaceholder}
                  className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-[var(--color-cta)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--color-cta)]/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground/80 ml-1">{t.emailLabel}</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  placeholder={t.emailPlaceholder}
                  className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-[var(--color-cta)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--color-cta)]/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium text-foreground/80 ml-1">{t.messageLabel}</label>
              <textarea
                id="message"
                name="message"
                required
                rows={4}
                placeholder={t.messagePlaceholder}
                className="w-full resize-none rounded-xl border border-border bg-background/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-[var(--color-cta)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--color-cta)]/50 transition-all"
              />
            </div>

            <Button disabled={isPending} type="submit" className="mt-3 w-full ds-btn-primary gap-2 py-6 text-base rounded-xl font-semibold">
              {isPending ? (
                <>{t.sending} <Loader2 size={18} className="ml-1 animate-spin" aria-hidden="true" /></>
              ) : (
                <>{t.submit} <Send size={18} className="ml-1" aria-hidden="true" /></>
              )}
            </Button>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
