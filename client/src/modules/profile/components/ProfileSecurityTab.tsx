"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { FormProvider, useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FormSection, TextField } from "@/components/form";
import { extractErrorMessage } from "@/lib/api/errorUtils";
import { applyServerErrors } from "@/lib/api/formErrors";
import type { ChangePasswordInput } from "../types";
import { useChangePasswordMutation } from "../hooks/useProfileQuery";

const EMPTY: ChangePasswordInput = { old_password: "", new_password: "", confirm_password: "" };

/** Đổi mật khẩu của chính người đang đăng nhập */
export function ProfileSecurityTab() {
  const t = useTranslations("profile");
  const tv = useTranslations("validation");
  const form = useForm<ChangePasswordInput>({ defaultValues: EMPTY });
  const changePassword = useChangePasswordMutation();

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await changePassword.mutateAsync(values);
      form.reset(EMPTY);
    } catch (error) {
      if (!applyServerErrors(form, error)) toast.error(extractErrorMessage(error, t("password.failed")));
    }
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} noValidate className="max-w-xl rounded-lg border bg-card p-5">
        <fieldset disabled={changePassword.isPending}>
          <FormSection title={t("password.title")} description={t("password.description")} columns={1}>
            <TextField<ChangePasswordInput>
              name="old_password"
              label={t("password.current")}
              type="password"
              autoComplete="current-password"
              rules={{ required: t("password.currentRequired") }}
            />
            <TextField<ChangePasswordInput>
              name="new_password"
              label={t("password.new")}
              type="password"
              autoComplete="new-password"
              rules={{ required: t("password.newRequired"), minLength: { value: 8, message: tv("minLength", { min: 8 }) } }}
            />
            <TextField<ChangePasswordInput>
              name="confirm_password"
              label={t("password.confirm")}
              type="password"
              autoComplete="new-password"
              rules={{ required: t("password.confirmRequired"), validate: (v, all) => v === all.new_password || tv("passwordMismatch") }}
            />
          </FormSection>
          <div className="flex justify-end border-t pt-4">
            <Button type="submit" disabled={changePassword.isPending}>
              {changePassword.isPending && <Loader2 className="animate-spin" />}
              {t("password.title")}
            </Button>
          </div>
        </fieldset>
      </form>
    </FormProvider>
  );
}
