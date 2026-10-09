"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Slot } from "radix-ui";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useConfirm } from "@/components/feedback/confirm";

export interface DeleteConfirmProps {
  title?: string;
  description?: string;
  /** Có thể trả Promise: hộp xác nhận giữ trạng thái "đang xử lý" tới khi xong */
  onConfirm: () => unknown;
  recordName?: string;
  tooltip?: string;
  loading?: boolean;
  disabled?: boolean;
  /** Phần tử kích hoạt tùy chỉnh (mặc định: nút thùng rác đỏ) */
  children?: React.ReactElement;
}

/** Nút xóa có bước xác nhận (dùng hộp xác nhận chung useConfirm) */
export function DeleteConfirm({
  title,
  description,
  onConfirm,
  recordName,
  tooltip,
  loading = false,
  disabled = false,
  children,
}: DeleteConfirmProps) {
  const tc = useTranslations("common");
  const confirm = useConfirm();
  const titleText = title ?? `${tc("actions.delete")}${recordName ? ` "${recordName}"` : ""}?`;
  const tooltipText = tooltip ?? tc("actions.delete");
  const descText = description || tc("messages.deleteIrreversible");

  const open = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (disabled || loading) return;
    confirm({ title: titleText, description: descText, confirmText: tc("actions.delete"), danger: true, onConfirm: () => onConfirm() });
  };

  if (children) return <Slot.Root onClick={open}>{children}</Slot.Root>;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="text-destructive hover:text-destructive" aria-label={tooltipText} disabled={disabled || loading} onClick={open}>
          <Trash2 />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tooltipText}</TooltipContent>
    </Tooltip>
  );
}
