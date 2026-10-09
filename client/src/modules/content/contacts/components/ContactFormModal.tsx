"use client";

import React, { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { FormDialog, FormSection, SwitchField, TextField, TextareaField } from "@/components/form";
import type { ContactCreateInput, ContactItem, ContactUpdateInput } from "../types";

interface ContactFormValues {
  name: string;
  email: string;
  message: string;
  description: string;
  is_active: boolean;
}

interface ContactFormModalProps {
  open: boolean;
  editing: ContactItem | null;
  onCancel: () => void;
  /** Ném lỗi lại: FormDialog gắn lỗi backend vào từng ô nhập, lỗi khác hiện toast */
  onSubmit: (values: ContactCreateInput | ContactUpdateInput) => Promise<void>;
  loading?: boolean;
}

const EMPTY: ContactFormValues = { name: "", email: "", message: "", description: "", is_active: true };

export function ContactFormModal({ open, editing, onCancel, onSubmit }: ContactFormModalProps) {
  const t = useTranslations("contacts");
  const tc = useTranslations("common");
  const tv = useTranslations("validation");
  const form = useForm<ContactFormValues>({ defaultValues: EMPTY });
  const isEditing = Boolean(editing);

  useEffect(() => {
    if (!open) return;
    form.reset(editing ? { name: editing.name, email: editing.email, message: editing.message, description: editing.description || "", is_active: editing.is_active ?? true } : EMPTY);
  }, [open, editing, form]);

  return (
    <FormDialog
      open={open}
      onClose={onCancel}
      title={isEditing ? t("form.editTitle", { code: editing?.name ?? "" }) : t("form.createTitle")}
      form={form}
      submitText={isEditing ? tc("actions.saveChanges") : t("form.createTitle")}
      onSubmit={async (values) => {
        await onSubmit({
          name: values.name.trim(),
          email: values.email.trim(),
          message: values.message.trim(),
          description: values.description?.trim() || "",
          is_active: values.is_active,
        });
      }}
    >
      <FormSection>
        <TextField<ContactFormValues> name="name" label={t("fields.name")} rules={{ required: tv("required", { field: t("fields.name") }), maxLength: { value: 150, message: tv("maxLength", { max: 150 }) } }} />
        <TextField<ContactFormValues> name="email" label={t("fields.email")} type="email" rules={{ required: tv("required", { field: t("fields.email") }), maxLength: { value: 255, message: tv("maxLength", { max: 255 }) } }} />
        <TextareaField<ContactFormValues> name="message" label={t("fields.message")} rows={6} rules={{ required: tv("required", { field: t("fields.message") }) }} className="form-section__full" />
        <TextareaField<ContactFormValues> name="description" label={tc("fields.description")} maxLength={500} className="form-section__full" />
        <SwitchField<ContactFormValues> name="is_active" label={tc("fields.status")} onText={tc("status.active")} offText={tc("status.inactive")} />
      </FormSection>
    </FormDialog>
  );
}
