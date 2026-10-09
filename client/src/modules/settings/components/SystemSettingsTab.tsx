"use client";

import React, { useEffect, useRef } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2, Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ComboboxField, FieldShell, FormSection, SelectField, TextField } from "@/components/form";
import { RelativeTime } from "@/components/list";
import { BrandMark } from "@/components/layouts/BrandMark";
import { http } from "@/lib/api/axiosClient";
import { extractErrorMessage } from "@/lib/api/errorUtils";
import { applyServerErrors } from "@/lib/api/formErrors";
import { SYSTEM_SETTINGS_KEY } from "@/hooks/useSystemSettings";
import type { Schemas } from "@/types/api";

type Settings = Schemas["SystemSettings"];
type SettingsInput = Pick<Settings, "app_name" | "app_badge" | "tagline" | "company_name" | "timezone" | "date_format" | "number_format">;

const TIMEZONES = ["Asia/Ho_Chi_Minh", "Asia/Bangkok", "Asia/Singapore", "Asia/Shanghai", "Asia/Tokyo", "Europe/London", "America/New_York", "UTC"].map((v) => ({ value: v, label: v }));
const DATE_FORMATS = ["DD/MM/YYYY", "YYYY-MM-DD", "MM/DD/YYYY"].map((v) => ({ value: v, label: v }));

const pick = (s: Settings): SettingsInput => ({
  app_name: s.app_name,
  app_badge: s.app_badge ?? "",
  tagline: s.tagline ?? "",
  company_name: s.company_name ?? "",
  timezone: s.timezone,
  date_format: s.date_format,
  number_format: s.number_format,
});

/** Tab "Cấu hình hệ thống": nhận diện ứng dụng + định dạng mặc định. Chỉ xem khi thiếu SETTINGS_UPDATE. */
export function SystemSettingsTab({ canEdit }: { canEdit: boolean }) {
  const t = useTranslations("settings.system");
  const tv = useTranslations("validation");
  const numberFormats = [
    { value: "INTL", label: t("numberFormatIntl") },
    { value: "VN", label: t("numberFormatVn") },
  ];
  const form = useForm<SettingsInput>();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: [...SYSTEM_SETTINGS_KEY, "admin"],
    queryFn: () => http.get<Settings>("/system-settings/"),
  });

  useEffect(() => {
    if (data) form.reset(pick(data));
  }, [data, form]);

  const onSaved = (next: Settings) => {
    qc.setQueryData([...SYSTEM_SETTINGS_KEY, "admin"], next);
    qc.invalidateQueries({ queryKey: [...SYSTEM_SETTINGS_KEY, "public"] });
  };

  const save = useMutation({
    mutationFn: (values: SettingsInput) => http.patch<Settings>("/system-settings/", values),
    onSuccess: (next) => {
      onSaved(next);
      toast.success(t("saved"));
    },
    onError: (error) => {
      if (!applyServerErrors(form, error)) toast.error(extractErrorMessage(error, t("saveError")));
    },
  });

  const uploadLogo = useMutation({
    mutationFn: (file: File) => {
      const body = new FormData();
      body.append("file", file);
      return http.post<Settings>("/system-settings/logo/", body);
    },
    onSuccess: (next) => {
      onSaved(next);
      toast.success(t("logoUpdated"));
    },
    onError: (error) => toast.error(extractErrorMessage(error, t("logoUploadError"))),
  });

  const removeLogo = useMutation({
    mutationFn: () => http.delete<Settings>("/system-settings/logo/"),
    onSuccess: (next) => {
      onSaved(next);
      toast.success(t("logoRemoved"));
    },
    onError: (error) => toast.error(extractErrorMessage(error, t("logoRemoveError"))),
  });

  if (isLoading || !data) {
    return (
      <div className="max-w-3xl space-y-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-9 w-full" />
        ))}
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      <form className="max-w-3xl" onSubmit={form.handleSubmit((v) => save.mutate(v))} noValidate>
        <fieldset disabled={!canEdit}>
          <FormSection title={t("brandingTitle")} description={t("brandingDescription")}>
            <TextField<SettingsInput> name="app_name" label={t("appName")} rules={{ required: tv("required", { field: t("appName") }), maxLength: { value: 100, message: tv("maxLength", { max: 100 }) } }} />
            <TextField<SettingsInput> name="app_badge" label={t("appBadge")} placeholder={t("appBadgePlaceholder")} rules={{ maxLength: { value: 30, message: tv("maxLength", { max: 30 }) } }} />
            <TextField<SettingsInput> name="tagline" label={t("tagline")} rules={{ maxLength: { value: 150, message: tv("maxLength", { max: 150 }) } }} />
            <TextField<SettingsInput> name="company_name" label={t("companyName")} rules={{ maxLength: { value: 255, message: tv("maxLength", { max: 255 }) } }} />
            <FieldShell id="f-logo" label={t("logo")} hint={t("logoHint")} className="form-section__full">
              <div className="flex flex-wrap items-center gap-3">
                <BrandMark logoUrl={data.logo_url ?? null} name={data.app_name} size={48} />
                {canEdit && (
                  <>
                    <input
                      ref={fileRef}
                      id="f-logo"
                      type="file"
                      accept=".png,.jpg,.jpeg,.webp,.svg"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadLogo.mutate(file);
                        e.target.value = "";
                      }}
                    />
                    <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploadLogo.isPending}>
                      {uploadLogo.isPending ? <Loader2 className="animate-spin" /> : <Upload />}
                      {t("uploadLogo")}
                    </Button>
                    {data.logo_url && (
                      <Button type="button" variant="ghost" onClick={() => removeLogo.mutate()} disabled={removeLogo.isPending}>
                        <Trash2 />
                        {t("removeLogo")}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </FieldShell>
          </FormSection>

          <FormSection title={t("formatsTitle")} description={t("formatsDescription")}>
            <SelectField<SettingsInput> name="number_format" label={t("numberFormat")} options={numberFormats} />
            <SelectField<SettingsInput> name="date_format" label={t("dateFormat")} options={DATE_FORMATS} />
            <ComboboxField<SettingsInput> name="timezone" label={t("timezone")} options={TIMEZONES} />
          </FormSection>
        </fieldset>

        {canEdit && (
          <div className="flex flex-wrap items-center justify-end gap-3 border-t pt-4">
            {data.updated_at && (
              <span className="mr-auto text-xs text-muted-foreground">
                {t("updated")} <RelativeTime value={data.updated_at} by={data.updated_by_name ?? undefined} />
              </span>
            )}
            <Button type="submit" disabled={save.isPending || !form.formState.isDirty}>
              {save.isPending && <Loader2 className="animate-spin" />}
              {t("save")}
            </Button>
          </div>
        )}
      </form>
    </FormProvider>
  );
}
