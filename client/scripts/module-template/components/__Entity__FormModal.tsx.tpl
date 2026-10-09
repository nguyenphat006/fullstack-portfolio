"use client";

import React, { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { FormDialog, FormSection, SwitchField, TextField, TextareaField } from "@/components/form";
import type { __Entity__CreateInput, __Entity__Item, __Entity__UpdateInput } from "../types";

interface __Entity__FormValues {
  code: string;
  name: string;
  description: string;
  is_active: boolean;
}

interface __Entity__FormModalProps {
  open: boolean;
  editing: __Entity__Item | null;
  onCancel: () => void;
  /** Ném lỗi lại: FormDialog gắn lỗi backend vào từng ô nhập, lỗi khác hiện toast */
  onSubmit: (values: __Entity__CreateInput | __Entity__UpdateInput) => Promise<void>;
  loading?: boolean;
}

const EMPTY: __Entity__FormValues = { code: "", name: "", description: "", is_active: true };

export function __Entity__FormModal({ open, editing, onCancel, onSubmit }: __Entity__FormModalProps) {
  const t = useTranslations("__NS__");
  const tc = useTranslations("common");
  const tv = useTranslations("validation");
  const form = useForm<__Entity__FormValues>({ defaultValues: EMPTY });
  const isEditing = Boolean(editing);

  useEffect(() => {
    if (!open) return;
    form.reset(editing ? { code: editing.code, name: editing.name, description: editing.description || "", is_active: editing.is_active ?? true } : EMPTY);
  }, [open, editing, form]);

  return (
    <FormDialog
      open={open}
      onClose={onCancel}
      title={isEditing ? t("form.editTitle", { code: editing?.code ?? "" }) : t("form.createTitle")}
      form={form}
      submitText={isEditing ? tc("actions.saveChanges") : t("form.createTitle")}
      onSubmit={async (values) => {
        const common = { name: values.name.trim(), description: values.description?.trim() || "", is_active: values.is_active };
        await onSubmit(isEditing ? common : { ...common, code: values.code.trim().toUpperCase() });
      }}
    >
      <FormSection>
        <TextField<__Entity__FormValues>
          name="code"
          label={tc("fields.code")}
          disabled={isEditing}
          transform={(v) => v.toUpperCase()}
          inputClassName="font-mono font-semibold"
          rules={{
            required: isEditing ? false : tv("required", { field: tc("fields.code") }),
            pattern: { value: /^[A-Z0-9_-]+$/, message: t("form.codeFormat") },
            maxLength: { value: 50, message: tv("maxLength", { max: 50 }) },
          }}
        />
        <TextField<__Entity__FormValues>
          name="name"
          label={t("fields.name")}
          rules={{ required: tv("required", { field: t("fields.name") }), maxLength: { value: 255, message: tv("maxLength", { max: 255 }) } }}
        />
        <TextareaField<__Entity__FormValues> name="description" label={tc("fields.description")} maxLength={500} className="form-section__full" />
        <SwitchField<__Entity__FormValues> name="is_active" label={tc("fields.status")} onText={tc("status.active")} offText={tc("status.inactive")} />
      </FormSection>
    </FormDialog>
  );
}
