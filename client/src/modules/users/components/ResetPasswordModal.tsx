"use client";

import React, { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { FormDialog, TextField } from "@/components/form";

interface ResetPasswordModalProps {
  open: boolean;
  /** Tên hiển thị của tài khoản được đặt lại mật khẩu */
  accountName: string;
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (password: string) => Promise<unknown>;
}

interface ResetValues {
  password: string;
  confirm: string;
}

const EMPTY: ResetValues = { password: "", confirm: "" };

/** Quản trị đặt lại mật khẩu cho một tài khoản khác (PATCH /users/{id}/ { password }). */
export function ResetPasswordModal({ open, accountName, onCancel, onSubmit }: ResetPasswordModalProps) {
  const t = useTranslations("users");
  const tv = useTranslations("validation");
  const form = useForm<ResetValues>({ defaultValues: EMPTY });

  useEffect(() => {
    if (open) form.reset(EMPTY);
  }, [open, form]);

  return (
    <FormDialog
      open={open}
      onClose={onCancel}
      title={t("resetPassword.title")}
      description={accountName}
      size="sm"
      form={form}
      submitText={t("resetPassword.submit")}
      onSubmit={(values) => onSubmit(values.password)}
    >
      <TextField<ResetValues>
        name="password"
        label={t("form.newPassword")}
        type="password"
        autoComplete="new-password"
        rules={{ required: t("resetPassword.passwordRequired"), minLength: { value: 8, message: tv("minLength", { min: 8 }) } }}
      />
      <TextField<ResetValues>
        name="confirm"
        label={t("resetPassword.confirm")}
        type="password"
        autoComplete="new-password"
        rules={{ required: t("resetPassword.confirmRequired"), validate: (v, all) => v === all.password || tv("passwordMismatch") }}
      />
    </FormDialog>
  );
}
