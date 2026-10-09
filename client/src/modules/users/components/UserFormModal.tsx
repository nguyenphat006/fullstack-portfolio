"use client";

import React, { useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { ComboboxField, FormDialog, FormSection, SwitchField, TextField, TextareaField } from "@/components/form";
import { useRolesList } from "@/modules/settings";
import { useAuthStore } from "@/stores/useAuthStore";
import type { UserItem, CreateUserInput } from "../types";

export interface UserFormModalProps {
  open: boolean;
  editingUser: UserItem | null;
  loading?: boolean;
  onCancel: () => void;
  /** Ném lỗi lại để form gắn lỗi vào từng ô nhập */
  onSubmit: (values: CreateUserInput) => Promise<unknown> | void;
}

interface UserFormValues {
  username: string;
  full_name: string;
  email: string;
  phone_number: string;
  password: string;
  is_active: boolean;
  role_ids: number[];
  description: string;
}

const EMPTY: UserFormValues = { username: "", full_name: "", email: "", phone_number: "", password: "", is_active: true, role_ids: [], description: "" };

export function UserFormModal({ open, editingUser, onCancel, onSubmit }: UserFormModalProps) {
  const t = useTranslations("users");
  const tc = useTranslations("common");
  const tv = useTranslations("validation");
  const form = useForm<UserFormValues>({ defaultValues: EMPTY });
  const currentUser = useAuthStore((s) => s.user);
  /** id = 0: bản nhân bản -> tạo mới */
  const isEdit = Boolean(editingUser && editingUser.id > 0);
  const { data: rolesList } = useRolesList({ enabled: open });

  const roleOptions = useMemo(() => (rolesList ?? []).map((r) => ({ value: String(r.id), label: r.role_name, code: r.role_code })), [rolesList]);

  const isAdminUser = Boolean(
    isEdit && editingUser && (editingUser.is_superuser || editingUser.username === "admin" || editingUser.roles?.some((r) => r.role_code === "ADMIN")),
  );
  const isSelf = Boolean(isEdit && editingUser && currentUser && editingUser.id === currentUser.id);
  const lockReason = isSelf ? t("cannotLockSelf") : isAdminUser ? t("cannotLockAdmin") : undefined;

  useEffect(() => {
    if (!open) return;
    form.reset(
      editingUser
        ? {
            username: editingUser.username,
            full_name: editingUser.full_name || editingUser.name || "",
            email: editingUser.email ?? "",
            phone_number: editingUser.phone_number ?? "",
            password: "",
            is_active: editingUser.is_active,
            description: editingUser.description ?? "",
            role_ids: editingUser.roles?.map((r) => r.id) ?? [],
          }
        : EMPTY,
    );
  }, [open, editingUser, form]);

  return (
    <FormDialog
      open={open}
      onClose={onCancel}
      title={isEdit ? t("form.editTitle", { username: editingUser?.username ?? "" }) : t("form.createTitle")}
      form={form}
      submitText={isEdit ? tc("actions.saveChanges") : t("form.createSubmit")}
      onSubmit={async ({ password, ...values }) => {
        await onSubmit({ ...values, ...(password ? { password } : {}) });
      }}
    >
      <FormSection>
        <TextField<UserFormValues>
          name="username"
          label={t("fields.username")}
          placeholder="anh.le"
          autoComplete="off"
          disabled={isEdit}
          rules={{ required: t("form.usernameRequired"), minLength: { value: 3, message: tv("minLength", { min: 3 }) } }}
        />
        <TextField<UserFormValues> name="full_name" label={t("fields.fullName")} placeholder={t("form.fullNamePlaceholder")} rules={{ required: t("form.fullNameRequired") }} />
        <TextField<UserFormValues>
          name="email"
          label={t("fields.email")}
          type="email"
          placeholder="anh.le@congty.vn"
          rules={{ required: t("form.emailRequired"), pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: tv("email") } }}
        />
        <TextField<UserFormValues> name="phone_number" label={t("fields.phone")} placeholder="0901 234 567" />
        <ComboboxField<UserFormValues>
          name="role_ids"
          label={t("fields.roles")}
          multiple
          numeric
          options={roleOptions}
          placeholder={t("form.rolesPlaceholder")}
          className="form-section__full"
          rules={{ required: t("form.rolesRequired") }}
        />
        <TextField<UserFormValues>
          name="password"
          label={isEdit ? t("form.newPassword") : t("form.initialPassword")}
          type="password"
          autoComplete="new-password"
          placeholder={isEdit ? t("form.passwordKeep") : tv("minLength", { min: 8 })}
          rules={{ required: isEdit ? false : t("form.passwordRequired"), minLength: { value: 8, message: tv("minLength", { min: 8 }) } }}
        />
        <SwitchField<UserFormValues> name="is_active" label={tc("fields.status")} onText={tc("status.active")} offText={t("statusLocked")} disabled={Boolean(lockReason)} hint={lockReason} />
        <TextareaField<UserFormValues> name="description" label={tc("fields.note")} rows={2} placeholder={t("form.notePlaceholder")} className="form-section__full" />
      </FormSection>
    </FormDialog>
  );
}
