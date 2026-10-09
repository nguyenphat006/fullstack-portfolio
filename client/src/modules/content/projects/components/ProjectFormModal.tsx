"use client";

import React, { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { FormDialog, FormSection, SwitchField, TextField, TextareaField } from "@/components/form";
import type { ProjectCreateInput, ProjectItem, ProjectUpdateInput } from "../types";

interface ProjectFormValues {
  slug: string;
  title: string;
  summary: string;
  stack: string;
  year: string;
  image: string;
  color: string;
  role: string;
  content: string;
  live_url: string;
  github_url: string;
  featured: boolean;
  description: string;
  is_active: boolean;
}

interface ProjectFormModalProps {
  open: boolean;
  editing: ProjectItem | null;
  onCancel: () => void;
  /** Ném lỗi lại: FormDialog gắn lỗi backend vào từng ô nhập, lỗi khác hiện toast */
  onSubmit: (values: ProjectCreateInput | ProjectUpdateInput) => Promise<void>;
  loading?: boolean;
}

const EMPTY: ProjectFormValues = {
  slug: "", title: "", summary: "", stack: "", year: String(new Date().getFullYear()), image: "", color: "#10b981",
  role: "", content: "", live_url: "", github_url: "", featured: false, description: "", is_active: true,
};

export function ProjectFormModal({ open, editing, onCancel, onSubmit }: ProjectFormModalProps) {
  const t = useTranslations("projects");
  const tc = useTranslations("common");
  const tv = useTranslations("validation");
  const form = useForm<ProjectFormValues>({ defaultValues: EMPTY });
  const isEditing = Boolean(editing);

  useEffect(() => {
    if (!open) return;
    form.reset(editing ? {
      slug: editing.slug, title: editing.title, summary: editing.summary,
      stack: Array.isArray(editing.stack) ? editing.stack.join(", ") : "",
      year: editing.year, image: editing.image, color: editing.color, role: editing.role, content: editing.content,
      live_url: editing.live_url || "", github_url: editing.github_url || "", featured: editing.featured ?? false,
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
          summary: values.summary.trim(),
          stack: values.stack.split(",").map((s) => s.trim()).filter(Boolean),
          year: values.year.trim(),
          image: values.image.trim(),
          color: values.color.trim(),
          role: values.role.trim(),
          content: values.content,
          live_url: values.live_url.trim() || null,
          github_url: values.github_url.trim() || null,
          featured: values.featured,
          description: values.description?.trim() || "",
          is_active: values.is_active,
        });
      }}
    >
      <FormSection>
        <TextField<ProjectFormValues> name="slug" label={t("fields.slug")} transform={(v) => v.toLowerCase()} inputClassName="font-mono" rules={{ required: tv("required", { field: t("fields.slug") }), maxLength: { value: 150, message: tv("maxLength", { max: 150 }) } }} />
        <TextField<ProjectFormValues> name="title" label={t("fields.title")} rules={{ required: tv("required", { field: t("fields.title") }), maxLength: { value: 255, message: tv("maxLength", { max: 255 }) } }} />
        <TextareaField<ProjectFormValues> name="summary" label={t("fields.summary")} rows={3} rules={{ required: tv("required", { field: t("fields.summary") }) }} className="form-section__full" />
        <TextField<ProjectFormValues> name="stack" label={t("fields.stack")} hint={t("form.stackHint")} rules={{ required: tv("required", { field: t("fields.stack") }), maxLength: { value: 500, message: tv("maxLength", { max: 500 }) } }} />
        <TextField<ProjectFormValues> name="year" label={t("fields.year")} rules={{ required: tv("required", { field: t("fields.year") }), maxLength: { value: 10, message: tv("maxLength", { max: 10 }) } }} />
        <TextField<ProjectFormValues> name="role" label={t("fields.role")} rules={{ required: tv("required", { field: t("fields.role") }), maxLength: { value: 150, message: tv("maxLength", { max: 150 }) } }} />
        <TextField<ProjectFormValues> name="image" label={t("fields.image")} rules={{ required: tv("required", { field: t("fields.image") }), maxLength: { value: 500, message: tv("maxLength", { max: 500 }) } }} />
        <TextField<ProjectFormValues> name="color" label={t("fields.color")} rules={{ required: tv("required", { field: t("fields.color") }), maxLength: { value: 30, message: tv("maxLength", { max: 30 }) } }} />
        <TextField<ProjectFormValues> name="live_url" label={t("fields.liveUrl")} type="url" rules={{ maxLength: { value: 500, message: tv("maxLength", { max: 500 }) } }} />
        <TextField<ProjectFormValues> name="github_url" label={t("fields.githubUrl")} type="url" rules={{ maxLength: { value: 500, message: tv("maxLength", { max: 500 }) } }} />
        <TextareaField<ProjectFormValues> name="content" label={t("fields.content")} rows={10} rules={{ required: tv("required", { field: t("fields.content") }) }} className="form-section__full" />
        <SwitchField<ProjectFormValues> name="featured" label={t("fields.featured")} onText={tc("status.yes")} offText={tc("status.no")} />
        <TextareaField<ProjectFormValues> name="description" label={tc("fields.description")} maxLength={500} className="form-section__full" />
        <SwitchField<ProjectFormValues> name="is_active" label={tc("fields.status")} onText={tc("status.active")} offText={tc("status.inactive")} />
      </FormSection>
    </FormDialog>
  );
}
