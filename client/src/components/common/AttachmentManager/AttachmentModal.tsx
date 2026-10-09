"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AttachmentManager, type AttachmentManagerProps } from "./AttachmentManager";

export interface AttachmentModalProps extends AttachmentManagerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
}

/** Quản lý tệp đính kèm trong hộp thoại (khi không có trang chi tiết) */
export function AttachmentModal({ open, onClose, title, entityType, entityId, readonly, maxFileSizeMB }: AttachmentModalProps) {
  const t = useTranslations("attachments");
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="flex max-h-[calc(100vh-80px)] flex-col gap-0 p-0 sm:max-w-[880px]">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>{title || t("title")}</DialogTitle>
          <DialogDescription className="sr-only">
            {entityType} #{entityId}
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          {open && <AttachmentManager entityType={entityType} entityId={entityId} readonly={readonly} maxFileSizeMB={maxFileSizeMB} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AttachmentModal;
