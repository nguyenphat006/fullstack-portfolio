"use client";

import React, { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { FormDialog, SwitchField, TextField, TextareaField } from "@/components/form";
import type { RoleItem, RoleCreateInput, RoleUpdateInput } from "../types";

interface RoleFormModalProps {
  open: boolean;
  editingRole: RoleItem | null;
  onCancel: () => void;
  /** Ném lỗi lại để FormDialog gắn lỗi vào ô nhập */
  onSubmit: (values: RoleCreateInput | RoleUpdateInput) => Promise<void>;
  loading?: boolean;
}

interface RoleFormValues {
  role_code: string;
  role_name: string;
  description: string;
  is_active: boolean;
}

const EMPTY: RoleFormValues = { role_code: "", role_name: "", description: "", is_active: true };

export function RoleFormModal({ open, editingRole, onCancel, onSubmit }: RoleFormModalProps) {
  const t = useTranslations("settings.roleForm");
  const tc = useTranslations("common");
  const tv = useTranslations("validation");
  const form = useForm<RoleFormValues>({ defaultValues: EMPTY });
  const isEditing = Boolean(editingRole);
  const isSystemAdminRole = editingRole?.role_code === "ADMIN";

  useEffect(() => {
    if (!open) return;
    form.reset(
      editingRole
        ? { role_code: editingRole.role_code, role_name: editingRole.role_name, description: editingRole.description || "", is_active: editingRole.is_active }
        : EMPTY,
    );
  }, [open, editingRole, form]);

  return (
    <FormDialog
      open={open}
      onClose={onCancel}
      title={isEditing ? t("editTitle", { code: editingRole?.role_code ?? "" }) : t("createTitle")}
      description={isSystemAdminRole ? t("adminHint") : undefined}
      size="sm"
      form={form}
      submitText={isEditing ? tc("actions.saveChanges") : t("createTitle")}
      onSubmit={async (values) => {
        const common = { role_name: values.role_name.trim(), description: values.description?.trim() || "", is_active: values.is_active };
        await onSubmit(isEditing ? common : { role_code: values.role_code.toUpperCase().trim(), ...common });
      }}
    >
      <TextField<RoleFormValues>
        name="role_code"
        label={t("code")}
        placeholder={t("codePlaceholder")}
        disabled={isEditing}
        transform={(v) => v.toUpperCase()}
        inputClassName="font-mono font-semibold"
        rules={{
          required: isEditing ? false : tv("required", { field: t("code") }),
          pattern: { value: /^[A-Z0-9_]+$/, message: tv("codeFormat") },
          minLength: { value: 2, message: tv("minLength", { min: 2 }) },
          maxLength: { value: 50, message: tv("maxLength", { max: 50 }) },
        }}
      />
      <TextField<RoleFormValues>
        name="role_name"
        label={t("name")}
        placeholder={t("namePlaceholder")}
        rules={{ required: tv("required", { field: t("name") }), minLength: { value: 2, message: tv("minLength", { min: 2 }) }, maxLength: { value: 100, message: tv("maxLength", { max: 100 }) } }}
      />
      <TextareaField<RoleFormValues> name="description" label={tc("fields.description")} placeholder={t("descriptionPlaceholder")} maxLength={255} />
      <SwitchField<RoleFormValues>
        name="is_active"
        label={tc("fields.status")}
        onText={tc("status.active")}
        offText={tc("status.inactive")}
        disabled={isSystemAdminRole}
        hint={t("statusHint")}
      />
    </FormDialog>
  );
}
