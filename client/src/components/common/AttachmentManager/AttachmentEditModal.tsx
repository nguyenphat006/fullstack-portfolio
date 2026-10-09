"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient, type QueryKey } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { FormDialog, SelectField, TextField, TextareaField } from "@/components/form";
import { http } from "@/lib/api/axiosClient";
import type { AttachmentItem } from "./AttachmentManager";
import { CATEGORY_OPTIONS } from "./previewers";

export interface AttachmentEditModalProps {
  open: boolean;
  item: AttachmentItem | null;
  onClose: () => void;
  queryKey: QueryKey;
}

interface EditValues {
  file_name: string;
  file_category: string;
  description: string;
}

/** Sửa tên hiển thị, phân loại, ghi chú của tệp đính kèm */
export function AttachmentEditModal({ open, item, onClose, queryKey }: AttachmentEditModalProps) {
  const t = useTranslations("attachments");
  const tc = useTranslations("common");
  const tr = useTranslations();
  const categoryOptions = CATEGORY_OPTIONS.map((o) => ({ value: o.value, label: tr(o.label) }));
  const form = useForm<EditValues>({ defaultValues: { file_name: "", file_category: "DOCUMENT", description: "" } });
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open && item) form.reset({ file_name: item.file_name, file_category: item.file_category || "DOCUMENT", description: item.description || "" });
  }, [open, item, form]);

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title={t("edit.title")}
      size="sm"
      form={form}
      submitText={tc("actions.saveChanges")}
      onSubmit={async (values) => {
        if (!item) return;
        await http.patch(`/attachments/${item.id}/`, values);
        await queryClient.invalidateQueries({ queryKey });
        toast.success(t("edit.done"));
        onClose();
      }}
    >
      <TextField<EditValues> name="file_name" label={t("edit.fileName")} rules={{ required: t("edit.fileNameRequired") }} />
      <SelectField<EditValues> name="file_category" label={t("columns.category")} options={categoryOptions} rules={{ required: t("edit.categoryRequired") }} />
      <TextareaField<EditValues> name="description" label={tc("fields.note")} rows={3} />
    </FormDialog>
  );
}

export default AttachmentEditModal;
