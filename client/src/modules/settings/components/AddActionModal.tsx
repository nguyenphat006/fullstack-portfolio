"use client";

import React, { useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useForm, useWatch } from "react-hook-form";
import { FormDialog, SelectField, TextField, TextareaField } from "@/components/form";
import { ACTION_CONFIGS } from "@/constants/permissionTags";
import type { ModuleRegistryItem, AddActionInput } from "../types";

interface AddActionModalProps {
  open: boolean;
  module: ModuleRegistryItem | null;
  onCancel: () => void;
  /** Ném lỗi lại để FormDialog gắn lỗi vào ô nhập */
  onSubmit: (data: AddActionInput) => Promise<void>;
  loading?: boolean;
}

interface ActionFormValues {
  action_code: string;
  action_name: string;
  description: string;
}

const EMPTY: ActionFormValues = { action_code: "", action_name: "", description: "" };
/** Thêm 1 quyền <MÃ PHÂN HỆ>_<HÀNH ĐỘNG> cho phân hệ */
export function AddActionModal({ open, module, onCancel, onSubmit }: AddActionModalProps) {
  const t = useTranslations("settings.addAction");
  const tr = useTranslations();
  const tc = useTranslations("common");
  const tv = useTranslations("validation");
  const actionOptions = useMemo(() => Object.values(ACTION_CONFIGS).map((a) => ({ value: a.code, label: `${a.code} — ${tr(a.label)}` })), [tr]);
  const form = useForm<ActionFormValues>({ defaultValues: EMPTY });
  const code = useWatch({ control: form.control, name: "action_code" });

  useEffect(() => {
    if (open) form.reset(EMPTY);
  }, [open, form]);

  // Chọn hành động -> gợi ý tên hiển thị (nếu người dùng chưa tự nhập)
  useEffect(() => {
    if (code && !form.getFieldState("action_name").isDirty) form.setValue("action_name", ACTION_CONFIGS[code] ? tr(ACTION_CONFIGS[code].label) : "");
  }, [code, form, tr]);

  return (
    <FormDialog
      open={open}
      onClose={onCancel}
      title={t("title")}
      description={module ? `${module.module_name} (${module.module_code})` : undefined}
      size="sm"
      form={form}
      submitText={t("title")}
      onSubmit={(values) => onSubmit({ action_code: values.action_code, action_name: values.action_name.trim() || undefined, description: values.description.trim() || undefined })}
    >
      <SelectField<ActionFormValues> name="action_code" label={t("action")} options={actionOptions} placeholder={t("actionPlaceholder")} rules={{ required: tv("requiredSelect", { field: t("action") }) }} />
      <TextField<ActionFormValues> name="action_name" label={t("name")} placeholder={t("namePlaceholder")} />
      <TextareaField<ActionFormValues> name="description" label={tc("fields.note")} rows={2} placeholder={t("notePlaceholder")} />
    </FormDialog>
  );
}
