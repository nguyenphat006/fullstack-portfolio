"use client";

import React, { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { FormDialog, FormSection, SwitchField, TextField, TextareaField } from "@/components/form";
import type { BlogCreateInput, BlogItem, BlogUpdateInput } from "../types";

interface BlogFormValues {
  slug: string;
  title: string;
  excerpt: string;
  published_date: string;
  category: string;
  read_time: string;
  image: string;
  content: string;
  description: string;
  is_active: boolean;
}

interface BlogFormModalProps {
  open: boolean;
  editing: BlogItem | null;
  onCancel: () => void;
  /** Ném lỗi lại: FormDialog gắn lỗi backend vào từng ô nhập, lỗi khác hiện toast */
  onSubmit: (values: BlogCreateInput | BlogUpdateInput) => Promise<void>;
  loading?: boolean;
}

const EMPTY: BlogFormValues = {
  slug: "", title: "", excerpt: "", published_date: "", category: "", read_time: "", image: "", content: "", description: "", is_active: true,
};

export function BlogFormModal({ open, editing, onCancel, onSubmit }: BlogFormModalProps) {
  const t = useTranslations("blogs");
  const tc = useTranslations("common");
  const tv = useTranslations("validation");
  const form = useForm<BlogFormValues>({ defaultValues: EMPTY });
  const isEditing = Boolean(editing);

  useEffect(() => {
    if (!open) return;
    form.reset(editing ? {
      slug: editing.slug, title: editing.title, excerpt: editing.excerpt, published_date: editing.published_date,
      category: editing.category, read_time: editing.read_time, image: editing.image, content: editing.content,
      description: editing.description || "", is_active: editing.is_active ?? true,
    } : EMPTY);
  }, [open, editing, form]);

  return (
    <FormDialog
      open={open}
      onClose={onCancel}
      title={isEditing ? t("form.editTitle", { code: editing?.slug ?? "" }) : t("form.createTitle")}
      form={form}
      submitText={isEditing ? tc("actions.saveChanges") : t("form.createTitle")}
      onSubmit={async (values) => {
        await onSubmit({
          slug: values.slug.trim().toLowerCase(),
          title: values.title.trim(),
          excerpt: values.excerpt.trim(),
          published_date: values.published_date.trim(),
          category: values.category.trim(),
          read_time: values.read_time.trim(),
          image: values.image.trim(),
          content: values.content,
          description: values.description?.trim() || "",
          is_active: values.is_active,
        });
      }}
    >
      <FormSection>
        <TextField<BlogFormValues> name="slug" label={t("fields.slug")} transform={(v) => v.toLowerCase()} inputClassName="font-mono" rules={{ required: tv("required", { field: t("fields.slug") }), maxLength: { value: 150, message: tv("maxLength", { max: 150 }) } }} />
        <TextField<BlogFormValues> name="title" label={t("fields.title")} rules={{ required: tv("required", { field: t("fields.title") }), maxLength: { value: 255, message: tv("maxLength", { max: 255 }) } }} />
        <TextareaField<BlogFormValues> name="excerpt" label={t("fields.excerpt")} rows={3} rules={{ required: tv("required", { field: t("fields.excerpt") }) }} className="form-section__full" />
        <TextField<BlogFormValues> name="published_date" label={t("fields.publishedDate")} rules={{ required: tv("required", { field: t("fields.publishedDate") }), maxLength: { value: 30, message: tv("maxLength", { max: 30 }) } }} />
        <TextField<BlogFormValues> name="category" label={t("fields.category")} rules={{ required: tv("required", { field: t("fields.category") }), maxLength: { value: 100, message: tv("maxLength", { max: 100 }) } }} />
        <TextField<BlogFormValues> name="read_time" label={t("fields.readTime")} rules={{ required: tv("required", { field: t("fields.readTime") }), maxLength: { value: 30, message: tv("maxLength", { max: 30 }) } }} />
        <TextField<BlogFormValues> name="image" label={t("fields.image")} rules={{ required: tv("required", { field: t("fields.image") }), maxLength: { value: 500, message: tv("maxLength", { max: 500 }) } }} />
        <TextareaField<BlogFormValues> name="content" label={t("fields.content")} rows={12} rules={{ required: tv("required", { field: t("fields.content") }) }} className="form-section__full" />
        <TextareaField<BlogFormValues> name="description" label={tc("fields.description")} maxLength={500} className="form-section__full" />
        <SwitchField<BlogFormValues> name="is_active" label={tc("fields.status")} onText={tc("status.active")} offText={tc("status.inactive")} />
      </FormSection>
    </FormDialog>
  );
}
