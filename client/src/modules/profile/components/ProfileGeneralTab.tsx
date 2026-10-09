"use client";

import React, { useEffect } from "react";
import { useTranslations } from "next-intl";
import { FormProvider, useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ACTIVE_STATUS, StatusBadge } from "@/components/common/StatusBadge";
import { FormSection, TextField, TextareaField } from "@/components/form";
import { formatDateTime, parseDateTime } from "@/components/list/renderers";
import { extractErrorMessage } from "@/lib/api/errorUtils";
import { applyServerErrors } from "@/lib/api/formErrors";
import type { UserProfile } from "../types";
import { useUpdateProfileMutation } from "../hooks/useProfileQuery";

interface ProfileGeneralTabProps {
  profile: UserProfile;
}

interface ProfileFormValues {
  full_name: string;
  phone_number: string;
  description: string;
}

function dateText(value?: string | null) {
  const d = parseDateTime(value);
  return d ? formatDateTime(d) : "—";
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate text-right">{children}</dd>
    </div>
  );
}

/** Thẻ nhận diện (chỉ xem) + form thông tin liên hệ có thể sửa */
export function ProfileGeneralTab({ profile }: ProfileGeneralTabProps) {
  const t = useTranslations("profile");
  const tc = useTranslations("common");
  const tv = useTranslations("validation");
  const updateMutation = useUpdateProfileMutation();
  const form = useForm<ProfileFormValues>({ defaultValues: { full_name: "", phone_number: "", description: "" } });

  useEffect(() => {
    form.reset({
      full_name: profile.full_name || profile.name || "",
      phone_number: profile.phone_number || "",
      description: profile.description || "",
    });
  }, [profile, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await updateMutation.mutateAsync({ full_name: values.full_name.trim(), phone_number: values.phone_number.trim(), description: values.description.trim() });
    } catch (error) {
      if (!applyServerErrors(form, error)) toast.error(extractErrorMessage(error, t("updateFailed")));
    }
  });

  const displayName = profile.full_name || profile.name || profile.username;
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const roles = profile.roles?.length ? profile.roles.map((r) => r.role_name || r.role_code) : (profile.role_codes ?? []);

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <section className="rounded-lg border bg-card p-5">
        <div className="flex items-center gap-3">
          <Avatar className="size-14">
            {profile.avatar && <AvatarImage src={profile.avatar} alt={displayName} />}
            <AvatarFallback className="text-base font-semibold text-white" style={{ background: "var(--c-brand-gradient)" }}>
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-semibold">{displayName}</p>
            <p className="truncate font-mono text-xs text-muted-foreground">@{profile.username}</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <StatusBadge map={ACTIVE_STATUS} value={profile.is_active} />
              {profile.is_superuser && <StatusBadge tone="accent" label={t("superAdmin")} />}
            </div>
          </div>
        </div>
        <dl className="mt-5 space-y-2.5 border-t pt-4">
          <Meta label={t("fields.roles")}>{roles.length ? roles.join(", ") : t("noRole")}</Meta>
          <Meta label={t("fields.email")}>{profile.email || "—"}</Meta>
          <Meta label={tc("fields.createdAt")}>{dateText(profile.created_at)}</Meta>
          <Meta label={t("fields.lastLogin")}>{dateText(profile.last_login)}</Meta>
        </dl>
      </section>

      <FormProvider {...form}>
        <form onSubmit={onSubmit} noValidate className="rounded-lg border bg-card p-5">
          <fieldset disabled={updateMutation.isPending}>
            <FormSection title={t("contact.title")} description={t("contact.description")}>
              <TextField<ProfileFormValues>
                name="full_name"
                label={t("fields.fullName")}
                placeholder={t("contact.fullNamePlaceholder")}
                rules={{ required: t("contact.fullNameRequired"), maxLength: { value: 150, message: tv("maxLength", { max: 150 }) } }}
              />
              <TextField<ProfileFormValues>
                name="phone_number"
                label={t("fields.phone")}
                placeholder="0912 345 678"
                rules={{ maxLength: { value: 20, message: tv("maxLength", { max: 20 }) } }}
              />
              <TextareaField<ProfileFormValues>
                name="description"
                label={t("fields.bio")}
                placeholder={t("contact.bioPlaceholder")}
                maxLength={500}
                className="form-section__full"
              />
            </FormSection>
            <div className="flex justify-end border-t pt-4">
              <Button type="submit" disabled={updateMutation.isPending || !form.formState.isDirty}>
                {updateMutation.isPending && <Loader2 className="animate-spin" />}
                {tc("actions.saveChanges")}
              </Button>
            </div>
          </fieldset>
        </form>
      </FormProvider>
    </div>
  );
}
