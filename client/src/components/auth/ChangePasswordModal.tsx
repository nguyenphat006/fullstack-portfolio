"use client";

import React, { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormDialog, TextField } from "@/components/form";
import { authService } from "@/modules/auth/services/auth.service";
import type { ChangePasswordRequest } from "@/modules/auth/types";

interface ChangePasswordModalProps {
  open: boolean;
  onCancel: () => void;
}

const EMPTY: ChangePasswordRequest = { old_password: "", new_password: "", confirm_password: "" };

/** Đổi mật khẩu của CHÍNH người đang đăng nhập (tài khoản khác dùng ResetPasswordModal). */
export function ChangePasswordModal({ open, onCancel }: ChangePasswordModalProps) {
  const t = useTranslations("auth");
  const tv = useTranslations("validation");
  const form = useForm<ChangePasswordRequest>({ defaultValues: EMPTY });

  useEffect(() => {
    if (open) form.reset(EMPTY);
  }, [open, form]);

  return (
    <FormDialog
      open={open}
      onClose={onCancel}
      title={t("changePassword.title")}
      size="sm"
      form={form}
      submitText={t("changePassword.title")}
      onSubmit={async (values) => {
        await authService.changePassword(values);
        toast.success(t("changePassword.done"));
        form.reset(EMPTY);
        onCancel();
      }}
    >
      <TextField<ChangePasswordRequest> name="old_password" label={t("changePassword.current")} type="password" autoComplete="current-password" rules={{ required: t("changePassword.currentRequired") }} />
      <TextField<ChangePasswordRequest>
        name="new_password"
        label={t("changePassword.new")}
        type="password"
        autoComplete="new-password"
        rules={{ required: t("changePassword.newRequired"), minLength: { value: 8, message: tv("minLength", { min: 8 }) } }}
      />
      <TextField<ChangePasswordRequest>
        name="confirm_password"
        label={t("changePassword.confirm")}
        type="password"
        autoComplete="new-password"
        rules={{ required: t("changePassword.confirmRequired"), validate: (v, all) => v === all.new_password || tv("passwordMismatch") }}
      />
    </FormDialog>
  );
}

export default ChangePasswordModal;
