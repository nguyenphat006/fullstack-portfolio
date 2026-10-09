"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { FormProvider, type FieldValues, type UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useConfirm } from "@/components/feedback/confirm";
import { extractErrorMessage } from "@/lib/api/errorUtils";
import { applyServerErrors } from "@/lib/api/formErrors";
import { cn } from "@/lib/utils";

interface FormDialogProps<T extends FieldValues> {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  form: UseFormReturn<T>;
  /** Ném lỗi lại: lỗi theo trường tự gắn vào ô nhập, lỗi khác hiện toast */
  onSubmit: (values: T) => Promise<unknown>;
  submitText?: string;
  /** sm 480 · md 640 (mặc định) · lg 880 · xl 1040 */
  size?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
  footerExtra?: React.ReactNode;
  /** Chế độ chỉ xem (thiếu quyền) — ẩn nút lưu */
  readOnly?: boolean;
}

const WIDTH = { sm: "sm:max-w-[480px]", md: "sm:max-w-[640px]", lg: "sm:max-w-[880px]", xl: "sm:max-w-[1040px]" };

/**
 * Hộp thoại form chuẩn: react-hook-form + gắn lỗi backend vào ô nhập + hỏi lại khi đóng lúc còn thay đổi chưa lưu.
 * Thân form cuộn trong hộp, header / footer cố định.
 */
export function FormDialog<T extends FieldValues>({
  open,
  onClose,
  title,
  description,
  form,
  onSubmit,
  submitText,
  size = "md",
  children,
  footerExtra,
  readOnly,
}: FormDialogProps<T>) {
  const t = useTranslations("form");
  const tc = useTranslations("common");
  const confirm = useConfirm();
  const [submitting, setSubmitting] = useState(false);
  // formState là Proxy: phải đọc trong lúc render thì react-hook-form mới theo dõi isDirty
  const { isDirty } = form.formState;

  const requestClose = async () => {
    if (submitting) return;
    if (isDirty && !readOnly) {
      const ok = await confirm({ title: t("discard.title"), description: t("discard.description"), confirmText: t("discard.confirm"), cancelText: t("discard.keepEditing"), danger: true });
      if (!ok) return;
    }
    onClose();
  };

  const submit = form.handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      if (!applyServerErrors(form, error)) toast.error(extractErrorMessage(error, tc("messages.saveError")));
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && requestClose()}>
      <DialogContent className={cn("flex max-h-[calc(100vh-80px)] flex-col gap-0 p-0", WIDTH[size])}>
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <FormProvider {...form}>
          <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col" noValidate>
            <fieldset disabled={readOnly} className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
              {children}
            </fieldset>
            <DialogFooter className="border-t px-6 py-3">
              {footerExtra && <div className="mr-auto flex items-center">{footerExtra}</div>}
              <Button type="button" variant="outline" onClick={requestClose} disabled={submitting}>
                {readOnly ? tc("actions.close") : tc("actions.cancel")}
              </Button>
              {!readOnly && (
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="animate-spin" />}
                  {submitText ?? tc("actions.save")}
                </Button>
              )}
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
