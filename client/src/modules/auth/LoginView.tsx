"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { FormProvider, useForm } from "react-hook-form";
import { CircleAlert, Languages, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/form";
import { BrandMark } from "@/components/layouts/BrandMark";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { useAuthStore } from "@/stores/useAuthStore";
import { extractErrorMessage } from "@/lib/api/errorUtils";
import { useChangeLocale } from "@/i18n/useChangeLocale";
import { authService } from "./services/auth.service";
import type { LoginRequest } from "./types";

export function LoginView() {
  const t = useTranslations("auth");
  const tc = useTranslations("common");
  const { locale, changeLocale, pending: localePending } = useChangeLocale();
  const router = useRouter();
  const branding = useSystemSettings();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const form = useForm<LoginRequest>({ defaultValues: { username: "", password: "" } });
  const submitting = form.formState.isSubmitting;

  const handleLogin = form.handleSubmit(async (values) => {
    setErrorMsg(null);
    try {
      const response = await authService.login(values);
      if (response?.tokens) {
        setAuth(response.user, response.tokens);
        router.push("/dashboard");
      }
    } catch (err) {
      setErrorMsg(extractErrorMessage(err, t("login.invalid")));
    }
  });

  return (
    // Nền thương hiệu cố định (không đổi theo sáng / tối)
    <div className="relative flex min-h-screen items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E3A8A 55%, #1E40AF 100%)" }}>
      {/* Đổi ngôn ngữ trước khi đăng nhập (nền tối cố định -> chữ trắng) */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute top-4 right-4 text-white/80 hover:bg-white/10 hover:text-white"
        disabled={localePending}
        onClick={() => changeLocale(locale === "vi" ? "en" : "vi")}
      >
        <Languages />
        {locale === "vi" ? tc("language.en") : tc("language.vi")}
      </Button>
      <div className="w-full max-w-[400px] rounded-xl border bg-card p-6 shadow-2xl sm:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <BrandMark logoUrl={branding.logoUrl} name={branding.name} size={48} />
          <h1 className="mt-3 text-xl font-semibold text-foreground">{branding.name}</h1>
          {(branding.tagline || branding.description) && <p className="mt-1 text-sm text-muted-foreground">{branding.tagline || branding.description}</p>}
        </div>

        {errorMsg && (
          <div role="alert" className="mb-4 flex items-start gap-2 rounded-md border border-[var(--c-error-border)] bg-[var(--c-error-bg)] px-3 py-2 text-sm text-[var(--c-error)]">
            <CircleAlert className="mt-0.5 size-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <FormProvider {...form}>
          <form onSubmit={handleLogin} noValidate>
            <TextField<LoginRequest>
              name="username"
              label={t("login.username")}
              placeholder={t("login.usernamePlaceholder")}
              autoComplete="username"
              rules={{ required: t("login.usernameRequired") }}
            />
            <TextField<LoginRequest>
              name="password"
              label={t("login.password")}
              type="password"
              placeholder={t("login.passwordPlaceholder")}
              autoComplete="current-password"
              rules={{ required: t("login.passwordRequired") }}
            />
            <Button type="submit" className="mt-2 h-10 w-full" disabled={submitting}>
              {submitting && <Loader2 className="animate-spin" />}
              {t("login.submit")}
            </Button>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
